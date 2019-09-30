import { createProxy } from './proxy'

const defaultHotOptions = {
  noPreserveState: false,
}

const registry = new Map()

const domReload = () => {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.reload
  ) {
    console.log('[HMR][Svelte] Reload')
    window.location.reload()
  } else {
    console.log('[HMR][Svelte] Full reload required')
  }
}

// One stop shop for HMR updates. Combines functionality of `configure`,
// `register`, and `reload`, based on current registry state.
//
// Additionaly does whatever it can to avoid crashing on runtime errors,
// and tries to decline HMR if that doesn't go well.
//
export function runUpdate({
  id,
  hotOptions,
  Component,
  ProxyAdapter,
  compileData,
}) {
  // resolve existing record
  let record = registry.get(id)
  let error = null
  let fatalError = null

  hotOptions = Object.assign({}, defaultHotOptions, hotOptions)

  // meta info from compilation (vars, things that could be inspected in AST...)
  // can be used to help the proxy better emulate the proxied component (and
  // better mock svelte hooks, in the wait for official support)
  if (compileData) {
    // NOTE we're making Component carry the load to minimize diff with base branch
    Component.$$hmrCompileData = compileData
  }

  // (re)render
  if (record) {
    if (record.hasFatalError()) {
      fatalError = true
    } else {
      error = !record.reload({ Component, hotOptions })
    }
  } else {
    record = createProxy(ProxyAdapter, id, Component, hotOptions)
    registry.set(id, record)
  }

  const proxy = record && record.proxy

  // well, endgame... we won't be able to render next updates, even successful,
  // if we don't have proxies in svelte's tree
  //
  // since we won't return the proxy and the app will expect a svelte component,
  // it's gonna crash... so it's best to report the real cause
  //
  // full reload required
  //
  if (!proxy) {
    throw new Error(`Failed to create HMR proxy for Svelte component ${id}`)
  }

  return { proxy, error, fatalError }
}

const logUnrecoverable = id => {
  console.log(
    `[HMR][Svelte] Unrecoverable error in ${id}: next update will trigger full reload`
  )
}

export function doApplyHmr(args) {
  try {
    const { id, reload = domReload, accept, decline, hotOptions } = args

    const { proxy, fatalError, error } = runUpdate(args)

    if (fatalError) {
      if (hotOptions && hotOptions.noReload) {
        console.log('[HMR][Svelte] Full reload required')
      } else {
        reload()
      }
    } else if (error) {
      logUnrecoverable(id)
      decline()
    } else {
      accept()
    }

    return proxy
  } catch (err) {
    const { id, decline } = args || {}
    logUnrecoverable(id)
    if (decline) {
      decline()
    }
    // since we won't return the proxy and the app will expect a svelte
    // component, it's gonna crash... so it's best to report the real cause
    throw err
  }
}
