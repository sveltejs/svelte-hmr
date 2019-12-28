/**
 * Emulates forthcoming HMR hooks in Svelte.
 *
 * All references to private component state ($$) are now isolated in this
 * module.
 */
import {
  current_component,
  get_current_component,
  set_current_component,
} from 'svelte/internal'

// NOTE excludes store subscriptions because it causes crashes (and also
// probably not intented to restore stores state -- stores lives outside of
// the HMR'd component normally)
const isWritable = v => !v.module && v.writable && v.name.substr(0, 1) !== '$'

const isProp = v => isWritable(v) && v.export_name != null

// Core $capture_state should be able to capture either only props or the whole
// local state (i.e. any `let` value). The best behaviour regarding HMR varies
// between projects, and even situations of what you're currently working on...
// It's better to leave it as an option to the end user.
const $capture_state = (cmp, { captureLocalState }) => {
  const compileData = cmp.constructor.$compile
  // actual $capture_state is the only thing that works in 3.16+ (correct
  // local state behaviour will be made possible when #3822 is merged)
  if (cmp.$capture_state) {
    // NOTE the captureLocalState option is fantasy for now
    return cmp.$capture_state({ captureLocalState })
  }
  if (compileData && compileData.vars) {
    const state = {}
    const filter = captureLocalState ? isWritable : isProp
    const vars = compileData.vars.filter(filter)
    const ctx = cmp.$$.ctx
    for (const { name } of vars) {
      state[name] = ctx[name]
    }
    return state
  }
  // else nothing, state won't be used for restore...
}

const captureState = (cmp, captureLocalState = true) => {
  // sanity check: propper behaviour here is to crash noisily so that
  // user knows that they're looking at something broken
  if (!cmp) {
    throw new Error('Missing component')
  }
  if (!cmp.$$) {
    throw new Error('Invalid component')
  }
  const {
    $$: { callbacks, bound, ctx },
  } = cmp
  const state = $capture_state(cmp, { captureLocalState })
  return { ctx, callbacks, bound, state }
}

// restoreState
//
// It is too late to restore context at this point because component instance
// function has already been called (and so context has already been read).
// Instead, we rely on setting current_component to the same value it has when
// the component was first rendered -- which fix support for context, and is
// also generally more respectful of normal operation.
//
const restoreState = (cmp, restore) => {
  if (!restore) {
    return
  }
  const { callbacks, bound, state } = restore
  if (callbacks) {
    cmp.$$.callbacks = callbacks
  }
  if (bound) {
    cmp.$$.bound = bound
  }
  if (state && cmp.$inject_state) {
    cmp.$inject_state(state)
  }
  // props, props.$$slots are restored at component creation (works
  // better -- well, at all actually)
}

const filterProps = (props, { vars } = {}) => {
  if (!vars) {
    return props
  }
  const result = {}
  vars
    .filter(v => !!v.export_name)
    .forEach(({ export_name }) => {
      result[export_name] = props[export_name]
    })
  Object.keys(props)
    .filter(name => name.substr(0, 2) === '$$')
    .forEach(key => {
      result[key] = props[key]
    })
  return result
}

export const createProxiedComponent = (
  Component,
  initialOptions,
  { noPreserveState, onInstance, onMount, onDestroy }
) => {
  let cmp
  let last
  let parentComponent
  let compileData
  let options = initialOptions

  const isCurrent = _cmp => cmp === _cmp

  const restoreOptions = restore => {
    const ctx = restore && restore.ctx
    if (ctx) {
      // if $inject_state is available (restore.state), then it will be used to
      // restore prop values, after the component has been recreated with the
      // initial props passed during component creation.
      //
      // NOTE original props contain slots: ctx.props.$$slots
      //
      // NOTE maybe compile data should be the preferred strategy because it
      // avoids creating the component with outdated prop values, and maybe it
      // can impact transitions or such. On the other hand, it seems somehow
      // more representative of the normal (i.e. non HMR) component behaviour,
      // to be created with the initial props and then transitionned to the
      // current value.
      if (!restore.state) {
        const props = filterProps(ctx, compileData)
        return { props }
      }
    }
  }

  const assignOptions = (target, anchor, restore) =>
    (options = Object.assign(
      {},
      initialOptions,
      { target, anchor },
      restoreOptions(restore)
    ))

  const instrument = targetCmp => {
    const createComponent = (Component, restore, previousCmp) => {
      set_current_component(parentComponent || previousCmp)
      const comp = new Component(options)
      restoreState(comp, restore)
      instrument(comp)
      return comp
    }

    // `conservative: true` means we want to be sure that the new component has
    // actually been successfuly created before destroying the old instance.
    // This could be useful for preventing runtime errors in component init to
    // bring down the whole HMR. Unfortunately the implementation bellow is
    // broken (FIXME), but that remains an interesting target for when HMR hooks
    // will actually land in Svelte itself.
    //
    // The goal would be to render an error inplace in case of error, to avoid
    // losing the navigation stack (especially annoying in native, that is not
    // based on URL navigation, so we lose the current page on each error).
    //
    targetCmp.$replace = (
      Component,
      { target = options.target, anchor = options.anchor, conservative = false }
    ) => {
      compileData = Component.$compile
      const restore = captureState(targetCmp, !noPreserveState)
      assignOptions(target, anchor, restore)
      const previous = cmp
      if (conservative) {
        try {
          const next = createComponent(Component, restore, previous)
          // prevents on_destroy from firing on non-final cmp instance
          cmp = null
          previous.$destroy()
          cmp = next
        } catch (err) {
          cmp = previous
          throw err
        }
      } else {
        // prevents on_destroy from firing on non-final cmp instance
        cmp = null
        if (previous) {
          // previous can be null if last constructor has crashed
          previous.$destroy()
        }
        cmp = createComponent(Component, restore, last)
        last = cmp
      }
      return cmp
    }

    // NOTE onMount must provide target & anchor (for us to be able to determinate
    // 			actual DOM insertion point)
    //
    // 			And also, to support keyed list, it needs to be called each time the
    // 			component is moved (same as $$.fragment.m)
    if (onMount) {
      const m = targetCmp.$$.fragment.m
      targetCmp.$$.fragment.m = (...args) => {
        const result = m(...args)
        onMount(...args)
        return result
      }
    }

    // NOTE onDestroy must be called even if the call doesn't pass through the
    //      component's $destroy method (that we can hook onto by ourselves, since
    //      it's public API) -- this happens a lot in svelte's internals, that
    //      manipulates cmp.$$.fragment directly, often binding to fragment.d,
    //      for example
    if (onDestroy) {
      targetCmp.$$.on_destroy.push(() => {
        if (isCurrent(targetCmp)) {
          onDestroy()
        }
      })
    }

    if (onInstance) {
      onInstance(targetCmp)
    }

    // Svelte 3 creates and mount components from their constructor if
    // options.target is present.
    //
    // This means that at this point, the component's `fragment.c` and,
    // most notably, `fragment.m` will already have been called _from inside
    // createComponent_. That is: before we have a chance to hook on it.
    //
    // Proxy's constructor
    //   -> createComponent
    //     -> component constructor
    //       -> component.$$.fragment.c(...) (or l, if hydrate:true)
    //       -> component.$$.fragment.m(...)
    //
    //   -> you are here <-
    //
    if (onMount) {
      const { target, anchor } = options
      if (target) {
        onMount(target, anchor)
      }
    }
  }

  // NOTE relying on dynamic bindings (current_component) makes us dependent on
  // bundler config (and apparently it does not work in demo-svelte-nollup)
  try {
    // unfortunately, unlike current_component, get_current_component() can
    // crash in the normal path (when there is really no parent)
    parentComponent = get_current_component()
  } catch (err) {
    // ... so we need to consider that this error means that there is no parent
    //
    // that makes us tightly coupled to the error message but, at least, we
    // won't mute an unexpected error, which is quite a horrible thing to do
    if (err.message === 'Function called outside component initialization') {
      // who knows...
      parentComponent = current_component
    } else {
      throw err
    }
  }

  cmp = new Component(options)

  instrument(cmp)

  return cmp
}
