const defaultHotOptions = {
  // don't preserve local state
  noPreserveState: false,
  // escape hatch from preserve local state -- if this string appears anywhere
  // in the component's code, then state won't be preserved for this update
  noPreserveStateKey: '@!hmr',
  // don't reload on fatal error
  noReload: false,
  // try to recover after runtime errors during component init
  optimistic: false,
  // auto accept modules of components that have named exports (i.e. exports
  // from context="module")
  acceptNamedExports: true,
  // auto accept modules of components have accessors (either accessors compile
  // option, or <svelte:option accessors={true} />) -- this means that if you
  // set accessors compile option globally, you must also set this option to
  // true, or no component will be hot reloaded (but there are a lot of edge
  // cases that HMR can't support correctly with accessors)
  acceptAccessors: true,
  // only inject CSS instead of recreating components when only CSS changes
  injectCss: true,
  // to mitigate FOUC between dispose (remove stylesheet) and accept
  cssEjectDelay: 100,
}

// const domAdapter = require.resolve('../runtime/proxy-adapter-dom.js')
const domAdapter = 'svelte-hmr/runtime/proxy-adapter-dom.js'

const nativeAdapter = require.resolve(
  '../runtime/svelte-native/proxy-adapter-native.js'
)

const quote = JSON.stringify

const posixify = file => file.replace(/[/\\]/g, '/')

const globalName = '___SVELTE_HMR_HOT_API'
const globalAdapterName = '___SVELTE_HMR_HOT_API_PROXY_ADAPTER'

// NOTE Native adapter cannot be required in code (as opposed to this
// generated code) because it requires modules from NativeScript's code that
// are not resolvable for non-native users (and those missing modules would
// prevent webpack from building).
//
const resolveImportAdapter = (
  hotOptions,
  importAdapterName = globalAdapterName
) => {
  const adapterPath = hotOptions.native
    ? posixify(nativeAdapter)
    : posixify(domAdapter)
  return { importAdapterName, adapterPath }
}

const renderApplyHmr = ({
  id,
  cssId,
  nonCssHash,
  hotOptions, // object
  options, // serialized
  hotApi,
  adapterPath,
  importAdapterName,
  meta,
  compileData,
  compileOptions,
  imports = [
    `import * as ${globalName} from '${posixify(hotApi)}'`,
    `import ${importAdapterName} from '${adapterPath}'`,
  ],
}) =>
  // this silly formatting keeps all original characters in their position,
  // except for the ';' in `export default Foo;`, and except if this is the
  // first line (very unlikely) -- thus saving us from having to provide a
  // sourcemap
  `${imports.join(';')};
export default $2
  = ${meta} && ${meta}.hot
    ? ${globalName}.applyHmr({
        m: ${meta},
        id: ${quote(id)},
        hotOptions: ${options},
        Component: $2,
        ProxyAdapter: ${importAdapterName},
        compileData: ${compileData},
        compileOptions: ${compileOptions},
        cssId: ${quote(cssId)},
        nonCssHash: ${quote(nonCssHash)},
      })
    : $2;
${
  // NOTE when doing CSS only voodoo, we have to inject the stylesheet as soon
  // as the component is loaded because Svelte normally do that when a component
  // is instantiated, but we might already have instances in the large when a
  // component is loaded with HMR
  hotOptions.injectCss && cssId
    ? `
if (typeof add_css !== 'undefined' && !document.getElementById(${quote(
        cssId
      )})) add_css();`
    : ``
}
`

// https://github.com/darkskyapp/string-hash/blob/master/index.js
// (via https://github.com/sveltejs/svelte/blob/91d758e35b2b2154512ddd11e6b6d9d65708a99e/src/compiler/compile/utils/hash.ts#L2)
const stringHashcode = str => {
  let hash = 5381
  let i = str.length
  while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i)
  return (hash >>> 0).toString(36)
}

const parseCssId = (code, parseHash) => {
  // the regex matching is very pretty conservative 'cause I don't want to
  // match something else by error... I'm probably make it more lax if I have
  // to fix it 3 times in a single week ¯\_(ツ)_/¯
  let match = /^function add_css\(\) \{[\s\S]*?^}/m.exec(code)
  if (!match) return {}
  const codeExceptCSS =
    code.slice(0, match.index) + code.slice(match.index + match[0].length)

  match = /\bstyle\.id\s*=\s*(['"])([^'"]*)\1/.exec(match[0])
  const cssId = match ? match[2] : null

  if (!parseHash || !cssId) return { cssId }

  const cssHash = cssId.split('-')[1]
  const nonCssHash = stringHashcode(
    codeExceptCSS.replace(new RegExp('\\b' + cssHash + '\\b', 'g'), '')
  )

  return { cssId, nonCssHash }
}

// meta can be 'import.meta' or 'module'
const createMakeHot = (hotApi, { meta = 'import.meta', walk } = {}) => {
  const hasAccessors = compiled => {
    if (!compiled.ast || !compiled.ast.html) return
    let accessors = false
    walk(compiled.ast.html, {
      enter(node) {
        if (accessors) return
        if (node.type !== 'Options') return
        if (!node.attributes) return
        accessors = node.attributes.some(
          ({ name, value }) => name === 'accessors' && value
        )
      },
    })
    return accessors
  }

  return function makeHot(
    id,
    compiledCode,
    hotOptionsArg,
    compiled,
    originalCode,
    compileOptions
  ) {
    const hotOptions = Object.assign({}, defaultHotOptions, hotOptionsArg)

    const noPreserveState =
      hotOptions.noPreserveState ||
      (hotOptions.noPreserveStateKey &&
        originalCode &&
        originalCode.indexOf(hotOptions.noPreserveStateKey) !== -1)

    const options = JSON.stringify({ ...hotOptions, noPreserveState })

    const compileData = JSON.stringify(
      compiled
        ? {
            vars: compiled.vars,
            accessors: hasAccessors(compiled),
          }
        : null
    )

    const { adapterPath, importAdapterName } = resolveImportAdapter(hotOptions)

    const { cssId, nonCssHash } = parseCssId(compiledCode, hotOptions.injectCss)

    const replacement = renderApplyHmr({
      id,
      cssId,
      nonCssHash,
      hotOptions,
      options,
      hotApi,
      adapterPath,
      importAdapterName,
      meta,
      compileData,
      compileOptions: JSON.stringify(compileOptions),
    })

    return compiledCode.replace(/(\n?export default ([^;]*);)/, replacement)
  }
}

module.exports = createMakeHot
