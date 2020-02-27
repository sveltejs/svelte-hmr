import { createProxy, hasFatalError } from './proxy'

const logPrefix = '[HMR:Svelte]'

// eslint-disable-next-line no-console
const log = (...args) => console.log(logPrefix, ...args)

const domReload = () => {
  // eslint-disable-next-line no-undef
  const win = typeof window !== 'undefined' && window
  if (win && win.location && win.location.reload) {
    log('Reload')
    win.location.reload()
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

const isNamedExport = v => v.export_name && v.module

let needsReload = false

function applyHmr(args) {
  const {
    id,
    reload = domReload,
    // normalized hot API (must conform to rollup-plugin-hot)
    hot,
    hotOptions,
    Component,
    compileData,
    compileOptions,
    ProxyAdapter,
  } = args

  const existing = hot.data && hot.data.record

  let canAccept = !existing || existing.current.canAccept

  // meta info from compilation (vars, things that could be inspected in AST...)
  // can be used to help the proxy better emulate the proxied component (and
  // better mock svelte hooks, in the wait for official support)
  if (compileData) {
    // NOTE we're making Component carry the load to minimize diff with base branch
    Component.$compile = compileData

    // if the module has named exports (in context="module"), then we can't
    // auto accept the component, since all the consumers need to be aware of
    // the change (e.g. rerender with the new exports value)
    if (!hotOptions.acceptNamedExports && canAccept) {
      const hasNamedExports = compileData.vars.some(isNamedExport)
      if (hasNamedExports) {
        canAccept = false
      }
    }

    // ...same for accessors: if accessible props change, then we need to
    // rerender/rerun all the consumers to reflect the change
    if (
      !hotOptions.acceptAccessors &&
      (compileData.accessors || (compileOptions && compileOptions.accessors))
    ) {
      canAccept = false
    }
  }

  const r =
    existing || createProxy(ProxyAdapter, id, Component, hotOptions, canAccept)

  r.update({ Component, hotOptions, canAccept })

  hot.dispose(data => {
    // handle previous fatal errors
    if (needsReload || hasFatalError()) {
      if (hotOptions && hotOptions.noReload) {
        log('Full reload required')
      } else {
        reload()
      }
    }

    data.record = r
  })

  if (canAccept) {
    hot.accept(async () => {
      const success = await r.reload()
      if (hasFatalError() || (!success && !hotOptions.optimistic)) {
        needsReload = true
      }
    })
  }

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
