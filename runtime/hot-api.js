import { createProxy } from './proxy'

const logPrefix = '[HMR:Svelte]'

const defaultHotOptions = {
  // don't preserve local state
  noPreserveState: false,
  // don't reload on fatal error
  noReload: false,
  // try to recover after runtime errors during component init
  optimistic: false,
}

const registry = new Map()

const log = (...args) => console.log(logPrefix, ...args)

const domReload = () => {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.reload
  ) {
    log('Reload')
    window.location.reload()
  } else {
    log('Full reload required')
  }
}

const defaultArgs = {
  reload: domReload,
}

export const makeApplyHmr = transformArgs => args => {
  const allArgs = transformArgs({ ...defaultArgs, ...args })
  return applyHmr(allArgs)
}

function applyHmr(args) {
  const {
    id,
    reload = domReload,
    // normalized hot API (must conform to rollup-plugin-hot)
    hot,
    hotOptions: hotOptionsArg,
    Component,
    compileData,
    ProxyAdapter,
  } = args

  const hotOptions = Object.assign({}, defaultHotOptions, hotOptionsArg)

  // meta info from compilation (vars, things that could be inspected in AST...)
  // can be used to help the proxy better emulate the proxied component (and
  // better mock svelte hooks, in the wait for official support)
  if (compileData) {
    // NOTE we're making Component carry the load to minimize diff with base branch
    Component.$$hmrCompileData = compileData
  }

  const existing = hot.data && hot.data.record
  const r = existing || createProxy(ProxyAdapter, id, Component, hotOptions)

  if (r.hasFatalError()) {
    if (hotOptions && hotOptions.noReload) {
      log('Full reload required')
    } else {
      reload()
    }
  }

  r.update({ Component, hotOptions })

  hot.dispose(data => {
    data.record = r
  })

  hot.accept(async () => {
    await r.reload()
    if (r.hasFatalError()) {
      if (hotOptions && hotOptions.noReload) {
        log('Full reload required')
      } else {
        reload()
      }
    }
  })

  // well, endgame... we won't be able to render next updates, even successful,
  // if we don't have proxies in svelte's tree
  //
  // since we won't return the proxy and the app will expect a svelte component,
  // it's gonna crash... so it's best to report the real cause
  //
  // full reload required
  //
  const proxyOk = r && r.proxy
  if (!proxyOk) {
    throw new Error(`Failed to create HMR proxy for Svelte component ${id}`)
  }

  return r.proxy
}
