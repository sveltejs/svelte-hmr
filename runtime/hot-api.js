import { createProxy } from './proxy'

const defaultHotOptions = {
  noPreserveState: false,
}

const registry = new Map()

const reload = () => {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.reload
  ) {
    window.location.reload()
  }
}

// One stop shop for HMR updates. Combines functionality of `configure`,
// `register`, and `reload`, based on current registry state.
//
// Additionaly does whatever it can to avoid crashing on runtime errors,
// and tries to decline HMR if that doesn't go well.
//
export function doApplyHMR(
  hotOptions,
  id,
  Component,
  ProxyAdapter,
  compileData
) {
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
    const success = record.reload({ Component, hotOptions })
    if (success === false) {
      error = true
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

  return { proxy, error }
}
