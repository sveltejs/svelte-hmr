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
// NOTE Failed to make require/dynamic imports work for Nollup
//
const resolveImportAdapter = (
  hotOptions,
  importAdapterName = globalAdapterName
) => {
  const adapterPath = hotOptions.native
    ? posixify(nativeAdapter)
    : posixify(domAdapter)
  const importAdapter = `import ${importAdapterName} from '${adapterPath}'`
  return { importAdapter, importAdapterName, adapterPath }
}

const createMakeHot = hotApi =>
  function makeHot(id, code, hotOptions = {}, compiled) {
    const options = JSON.stringify(hotOptions)

    const compileData = compiled
      ? JSON.stringify({
          vars: compiled.vars,
        })
      : null

    const { importAdapter, importAdapterName } = resolveImportAdapter(
      hotOptions
    )

    const replacement = `
      import * as ${globalName} from '${posixify(hotApi)}';
      ${importAdapter};
			if (
        typeof module !== 'undefined'
        && (module.meta && module.meta.hot || module.hot)
      ) {
        const { applyHmr } = ${globalName};
				$2 = applyHmr({
					m: module.meta || module,
					id: ${quote(id)},
					hotOptions: ${options},
					Component: $2,
					ProxyAdapter: ${importAdapterName},
					compileData: ${compileData}
				});
			}
			export default $2;
		`

    return code.replace(/(export default ([^;]*));/, replacement)
  }

module.exports = createMakeHot
