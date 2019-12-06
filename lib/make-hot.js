const domAdapter = require.resolve('../runtime/proxy-adapter-dom.js')

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
  options,
  hotApi,
  adapterPath,
  importAdapterName,
  meta,
  compileData,
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
        compileData: ${compileData}
      })
    : $2;
`

// meta can be 'import.meta' or 'module'
const createMakeHot = (hotApi, { meta = 'import.meta' } = {}) =>
  function makeHot(id, compiledCode, hotOptions = {}, compiled) {
    // TODO this is probably the worst possible implementation for @!hmr... but
    //      at least, it is cross bundler without API change for now...
    const code = compiledCode.replace(/(\b|['"])@!hmr\b/g, '     $1')
    const noPreserveState = hotOptions.noPreserveState || code !== compiledCode

    const options = JSON.stringify({ ...hotOptions, noPreserveState })

    const compileData = JSON.stringify(
      compiled ? { vars: compiled.vars } : null
    )

    const { adapterPath, importAdapterName } = resolveImportAdapter(hotOptions)

    const replacement = renderApplyHmr({
      id,
      options,
      hotApi,
      adapterPath,
      importAdapterName,
      meta,
      compileData,
    })

    return code.replace(/(\n?export default ([^;]*);)/, replacement)
  }

module.exports = createMakeHot
