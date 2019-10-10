/**
 * The HMR proxy is a component-like object whose task is to sit in the
 * component tree in place of the proxied component, and rerender each
 * successive versions of said component.
 */

import { createProxiedComponent } from './svelte-hooks'

const handledMethods = ['constructor', '$destroy']
const forwardedMethods = ['$set', '$on']

const noop = () => {}

const logError = (...args) => console.error('[HMR][Svelte]', ...args)

const posixify = file => file.replace(/[/\\]/g, '/')

const getBaseName = id =>
  id
    .split('/')
    .pop()
    .split('.')
    .slice(0, -1)
    .join('.')

const capitalize = str => str[0].toUpperCase() + str.slice(1)

const getFriendlyName = id => capitalize(getBaseName(posixify(id)))

const getDebugName = id => `<${getFriendlyName(id)}>`

const relayCalls = (getTarget, names, dest = {}) => {
  for (const key of names) {
    dest[key] = function(...args) {
      const target = getTarget()
      if (!target) {
        return
      }
      return target[key] && target[key].call(this, ...args)
    }
  }
  return dest
}

const copyComponentMethods = (proxy, cmp, debugName) => {
  //proxy custom methods
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(cmp))
  methods.forEach(method => {
    if (
      !handledMethods.includes(method) &&
      !forwardedMethods.includes(method)
    ) {
      proxy[method] = function() {
        if (cmp[method]) {
          return cmp[method].apply(this, arguments)
        } else {
          // we can end up here when calling a method added by a previous
          // version of the component, then removed (but still called
          // somewhere else in the code)
          //
          // TODO we should possibly consider removing all the methods that
          //   have been added by a previous version of the component. This
          //   would be better memory-wise. Not so much so complexity-wise,
          //   though. And for now, we can't survive most runtime errors, so
          //   we will be reloaded often...
          //
          throw new Error(
            `Called to undefined method on ${debugName}: ${method}`
          )
        }
      }
    }
  })
}

// everything in the constructor!
//
// so we don't polute the component class with new members
//
// specificity & conformance with Svelte component constructor is achieved
// in the "component level" (as opposed "instance level") createRecord
//
class ProxyComponent {
  constructor(
    {
      Adapter,
      id,
      debugName,
      current, // { Component, hotOptions: { noPreserveState, ... } }
      register,
      unregister,
      reportError,
    },
    options // { target, anchor, ... }
  ) {
    let cmp
    let disposed = false
    let lastError = null

    const destroyComponent = () => {
      // destroyComponent is tolerant (don't crash on no cmp) because it
      // is possible that reload/rerender is called after a previous
      // createComponent has failed (hence we have a proxy, but no cmp)
      if (cmp) {
        cmp.$destroy()
        cmp = null
      }
    }

    const refreshComponent = (target, anchor, conservativeDestroy) => {
      if (lastError) {
        lastError = null
        adapter.rerender()
      } else {
        try {
          if (conservativeDestroy) {
            cmp = cmp.$replace(current.Component, {
              target,
              anchor,
              conservative: true,
            })
          } else {
            cmp = cmp.$replace(current.Component, { target, anchor })
          }
        } catch (err) {
          const errString = String((err && err.stack) || err)
          setError(err, target, anchor)
          if (!current.hotOptions.optimistic || (err && err.hmrFatal)) {
            throw err
          } else {
            logError(`Error during component init ${debugName}: ${errString}`)
          }
        }
      }
    }

    // TODO need to use cmp.$replace
    const setError = (err, target, anchor) => {
      lastError = err
      adapter.renderError(err)
    }

    const instance = {
      hotOptions: current.hotOptions,
      proxy: this,
      id,
      debugName,
      refreshComponent,
    }

    const adapter = new Adapter(instance)

    const { afterMount, rerender } = adapter

    // $destroy is not called when a child component is disposed, so we
    // need to hook from fragment.
    const onDestroy = () => {
      // NOTE do NOT call $destroy on the cmp from here; the cmp is already
      //   dead, this would not work
      if (!disposed) {
        disposed = true
        adapter.dispose()
        unregister()
      }
    }

    // ---- register proxy instance ----

    register(rerender)

    // ---- augmented methods ----

    this.$destroy = () => {
      destroyComponent()
      onDestroy()
    }

    // ---- forwarded methods ----

    const getComponent = () => cmp

    relayCalls(getComponent, forwardedMethods, this)

    // ---- create & mount target component instance ---

    try {
      cmp = createProxiedComponent(current.Component, options, {
        noPreserveState: current.hotOptions.noPreserveState,
        onDestroy,
        onMount: afterMount,
        onInstance: comp => {
          // WARNING the proxy MUST use the same $$ object as its component
          // instance, because a lot of wiring happens during component
          // initialisation... lots of references to $$ and $$.fragment have
          // already been distributed around when the component constructor
          // returns, before we have a chance to wrap them (and so we can't
          // wrap them no more, because existing references would become
          // invalid)
          this.$$ = comp.$$
          copyComponentMethods(this, comp)
        },
      })
    } catch (err) {
      const { target, anchor } = options
      setError(err, target, anchor)
      throw err
    }
  }
}

const copyStatics = (component, proxy) => {
  //forward static properties and methods
  for (let key in component) {
    proxy[key] = component[key]
  }
}

/**
 * Creates a HMR proxy and its associated `reload` function that pushes a new
 * version to all existing instances of the component.
 */
export function createProxy(Adapter, id, Component, hotOptions) {
  let fatalError = false

  const debugName = getDebugName(id)
  const instances = []

  // current object will be updated, proxy instances will keep a ref
  const current = {
    Component,
    hotOptions,
  }

  const name = `Proxy${debugName}`

  // this trick gives the dynamic name Proxy<Component> to the concrete
  // proxy class... unfortunately, this doesn't shows in dev tools, but
  // it stills allow to inspect cmp.constructor.name to confirm an instance
  // is a proxy
  const proxy = {
    [name]: class extends ProxyComponent {
      constructor(options) {
        try {
          super(
            {
              Adapter,
              id,
              debugName,
              current,
              register: rerender => {
                instances.push(rerender)
              },
              unregister: () => {
                const i = instances.indexOf(this)
                instances.splice(i, 1)
              },
            },
            options
          )
        } catch (err) {
          // If we fail to create a proxy instance, any instance, that means
          // that we won't be able to fix this instance when it is updated.
          // Recovering to normal state will be impossible. HMR's dead.
          //
          // Fatal error will trigger a full reload on next update (reloading
          // right now is kinda pointless since buggy code still exists).
          //
          fatalError = true
          logError(
            `Unrecoverable error in ${debugName}: next update will trigger full reload`
          )
          throw err
        }
      }
    },
  }[name]

  // reload all existing instances of this component
  const reload = ({ Component, hotOptions }) => {
    // update current references
    Object.assign(current, { Component, hotOptions })

    // copy statics before doing anything because a static prop/method
    // could be used somewhere in the create/render call
    // TODO delete props/methods previously added and of which value has
    // not changed since
    copyStatics(Component, proxy)

    const errors = []

    instances.forEach(rerender => {
      try {
        rerender()
      } catch (err) {
        logError(
          `Failed to rerender ${debugName}: ${(err && err.stack) || err}`
        )
        errors.push(err)
      }
    })

    if (errors.length > 0) {
      return false
    }

    return true
  }

  const hasFatalError = () => fatalError

  return { id, proxy, reload, hasFatalError }
}
