const path = require('path')

const globalName = '___SVELTE_HMR_HOT_API'
const globalAdapterName = '___SVELTE_HMR_HOT_API_PROXY_ADAPTER'

const defaultHotOptions = {
  // preserve all local state
  preserveLocalState: false,

  // escape hatchs from preservation of local state
  //
  // disable preservation of state for this component
  noPreserveStateKey: ['@hmr:reset', '@!hmr'],
  // enable preservation of state for all variables in this component
  preserveAllLocalStateKey: '@hmr:keep-all',
  // enable preservation of state for a given variable (must be inline or
  // above the target variable or variables; can be repeated)
  preserveLocalStateKey: '@hmr:keep',

  // don't reload on fatal error
  noReload: false,
  // try to recover after runtime errors during component init
  optimistic: true,
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

  // Svelte Native mode
  native: false,
  // Vite mode
  // NOTE probably not neede anymore with Vite2, kept for compatibility with
  // existing Vite1 setups though
  compatVite: false,
  // name of the adapter import binding
  importAdapterName: globalAdapterName,
  // use absolute file paths to import runtime deps of svelte-hmr
  // (see https://github.com/rixo/svelte-hmr/issues/11)
  absoluteImports: true,

  // disable runtime error overlay
  noOverlay: false,
}

const defaultHotApi = 'hot-api-esm.js'

const quote = JSON.stringify

const posixify = file => file.replace(/[/\\]/g, '/')

const applyAbsoluteImports = (absoluteImports, target) => {
  const base = absoluteImports
    ? path.resolve(__dirname, '../runtime') + '/'
    : 'svelte-hmr/runtime/'
  return base + target
}

// NOTE Native adapter cannot be required in code (as opposed to this
// generated code) because it requires modules from NativeScript's code that
// are not resolvable for non-native users (and those missing modules would
// prevent webpack from building).
//
const resolveAdapterImport = ({ native, absoluteImports }) => {
  // careful with relative paths
  // (see https://github.com/rixo/svelte-hmr/issues/11)
  const file = native
    ? 'svelte-native/proxy-adapter-native.js'
    : 'proxy-adapter-dom.js'
  return posixify(applyAbsoluteImports(absoluteImports, file))
}

const resolveHotApiImport = ({ absoluteImports }, hotApiOpt) =>
  posixify(hotApiOpt || applyAbsoluteImports(absoluteImports, defaultHotApi))

const renderApplyHmr = ({
  id,
  cssId,
  nonCssHash,
  hotOptions: { injectCss, compatVite }, // object
  options, // serialized
  hotApiImport,
  adapterImport,
  importAdapterName,
  meta,
  acceptable,
  ignoreCss,
  imports = [
    `import * as ${globalName} from '${hotApiImport}'`,
    `import ${importAdapterName} from '${adapterImport}'`,
  ],
}) =>
  // this silly formatting keeps all original characters in their position,
  // thus saving us from having to provide a sourcemap
  //
  // NOTE the `if (false) accept()` line is for tools that wants to see the
  // accept call in the actual accepted module to enable HMR (Vite and, I
  // believe, Snowpack 3)
  //
  `${imports.join(';')};${`
    if (${compatVite ? '' : `${meta} && `}${meta}.hot) {
      if (false) import.meta.hot.accept();
      $2 = ${globalName}.applyHmr({
        m: ${meta},
        id: ${quote(id)},
        hotOptions: ${options},
        Component: $2,
        ProxyAdapter: ${importAdapterName},
        acceptable: ${JSON.stringify(acceptable)},
        cssId: ${quote(cssId)},
        nonCssHash: ${quote(nonCssHash)},
        ignoreCss: ${JSON.stringify(ignoreCss)},
      });
    }
  `
    .split('\n')
    .map(x => x.trim())
    .filter(Boolean)
    .join(' ')}
export default $2;
${
  // NOTE when doing CSS only voodoo, we have to inject the stylesheet as soon
  // as the component is loaded because Svelte normally do that when a component
  // is instantiated, but we might already have instances in the large when a
  // component is loaded with HMR
  injectCss && cssId
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

const normalizeNonCss = (code, cssHash) =>
  code
    // ignore css hashes in the code (that have changed, necessarily)
    .replace(new RegExp('\\b' + cssHash + '\\b', 'g'), '')
    // Svelte now adds locations in dev mode, code locations can change when
    // CSS change, but we're unaffected (not real behaviour changes)
    .replace(/\badd_location\s*\([^)]*\)\s*;?/g, '')

const parseCssId = (code, parseHash, originalCode, compileCss) => {
  // the regex matching is very pretty conservative 'cause I don't want to
  // match something else by error... I'm probably make it more lax if I have
  // to fix it 3 times in a single week ¯\_(ツ)_/¯
  let match = /^function add_css\(\) \{[\s\S]*?^}/m.exec(code)

  if (!match) {
    // guard: injectCss is off, no need to compute hashes
    if (!parseHash) return {}
    // guard: compile.css is true, so we should have found the add_css function,
    //        something unexpected is unraveling here, fall back to caution
    if (compileCss) return {}
    // trying to get CSS id the same way as Svelte does it
    match = /<style[^>]*>([\s\S]*)<\/\s*style\s*>/.exec(originalCode)
    const cssHash = match && match[1] ? stringHashcode(match[1]) : null
    if (!cssHash) return {}
    return {
      cssId: `svelte-${cssHash}-style`,
      nonCssHash: stringHashcode(normalizeNonCss(code, cssHash)),
    }
  }

  const codeExceptCSS =
    code.slice(0, match.index) + code.slice(match.index + match[0].length)

  match = /\bstyle\.id\s*=\s*(['"])([^'"]*)\1/.exec(match[0])
  const cssId = match ? match[2] : null

  if (!parseHash || !cssId) return { cssId }

  const cssHash = cssId.split('-')[1]
  const nonCssHash = stringHashcode(normalizeNonCss(codeExceptCSS, cssHash))

  return { cssId, nonCssHash }
}

const isNamedExport = v => v.export_name && v.module

const isProp = v => v.export_name && !v.module

// NOTE hotOptions can be customized by end user through plugin options, while
// options passed to this function can only customized by the plugin implementer
//
// meta can be 'import.meta' or 'module'
// const createMakeHot = (hotApi = defaultHotApi, options) => {
const createMakeHot = ({ walk, meta = 'import.meta', hotApi, adapter }) => {
  const resolvePreserveLocalStateKey = ({
    preserveLocalStateKey,
    compiled,
  }) => {
    const containsKey = comments =>
      comments &&
      comments.some(({ value }) => value.includes(preserveLocalStateKey))

    const variables = new Set()

    const addReference = node => {
      if (!node.name) {
        // eslint-disable-next-line no-console
        console.warn('Incorrect identifier for preserveLocalStateKey')
      }
      variables.add(node.name)
    }

    const processNodes = targets => targets.forEach(processNode)

    const processNode = node => {
      switch (node.type) {
        case 'Identifier':
          variables.add(node.name)
          return true
        case 'UpdateExpression':
          addReference(node.argument)
          return true
        case 'VariableDeclarator':
          addReference(node.id)
          return true
        case 'AssignmentExpression':
          processNode(node.left)
          return true
        case 'ExpressionStatement':
          processNode(node.expression)
          return true

        case 'VariableDeclaration':
          processNodes(node.declarations)
          return true
        case 'SequenceExpression': // ++, --
          processNodes(node.expressions)
          return true
      }
      return false
    }

    const stack = []

    if (compiled.ast.instance) {
      walk(compiled.ast.instance, {
        leave() {
          stack.shift()
        },
        enter(node) {
          stack.unshift(node)
          if (
            containsKey(node.leadingComments) ||
            containsKey(node.trailingComments)
          ) {
            stack
              .slice(0, 3)
              .reverse()
              .some(processNode)
          }
        },
      })
    }

    return [...variables]
  }

  const resolvePreserveLocalState = ({
    hotOptions,
    originalCode,
    compiled,
  }) => {
    const {
      preserveLocalState,
      noPreserveStateKey,
      preserveLocalStateKey,
      preserveAllLocalStateKey,
    } = hotOptions
    if (originalCode) {
      const hasKey = key => {
        const test = k => originalCode.indexOf(k) !== -1
        return Array.isArray(key) ? key.some(test) : test(key)
      }
      // noPreserveStateKey
      if (noPreserveStateKey && hasKey(noPreserveStateKey)) {
        return false
      }
      // preserveAllLocalStateKey
      if (preserveAllLocalStateKey && hasKey(preserveAllLocalStateKey)) {
        return true
      }
      // preserveLocalStateKey
      if (preserveLocalStateKey && hasKey(preserveLocalStateKey)) {
        // returns an array of variable names to preserve
        return resolvePreserveLocalStateKey({ preserveLocalStateKey, compiled })
      }
    }
    // preserveLocalState
    if (preserveLocalState) {
      return true
    }
    return false
  }

  const hasAccessorsOption = compiled => {
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

  const isAcceptable = (hotOptions, compileOptions, compiled) => {
    if (!compiled || !compileOptions) {
      // this should never happen, since it's the bundler plugins that control
      // what version of svelte-hmr they embark, and they should be kept up to
      // date with our API
      //
      // eslint-disable-next-line no-console
      console.warn(
        'WARNING Your bundler plugin is outdated for this version of svelte-hmr'
      )
      return true
    }

    const { vars } = compiled

    // if the module has named exports (in context="module"), then we can't
    // auto accept the component, since all the consumers need to be aware of
    // the change (e.g. rerender with the new exports value)
    if (!hotOptions.acceptNamedExports && vars.some(isNamedExport)) {
      return false
    }

    // ...same for accessors: if accessible props change, then we need to
    // rerender/rerun all the consumers to reflect the change
    //
    // NOTE we can still accept components with no props, since they won't
    // have accessors... this is actually all we can safely accept in this case
    //
    if (
      !hotOptions.acceptAccessors &&
      // we test is we have props first, because searching for the
      // <svelte:options /> tag in the AST is probably the most expensive here
      vars.some(isProp) &&
      (compileOptions.accessors || hasAccessorsOption(compiled))
    ) {
      return false
    }

    return true
  }

  const parseMakeHotArgs = args => {
    // case: named args (object)
    if (args.length === 1) return args[0]
    // case: legacy (positional)
    const [
      id,
      compiledCode,
      hotOptions,
      compiled,
      originalCode,
      compileOptions,
    ] = args
    return {
      id,
      compiledCode,
      hotOptions,
      compiled,
      originalCode,
      compileOptions,
    }
  }

  function makeHot(...args) {
    const {
      id,
      compiledCode,
      hotOptions: hotOptionsArg,
      compiled,
      originalCode,
      compileOptions,
    } = parseMakeHotArgs(args)

    const hotOptions = Object.assign({}, defaultHotOptions, hotOptionsArg)

    const { importAdapterName } = hotOptions

    const preserveLocalState = resolvePreserveLocalState({
      hotOptions,
      originalCode,
      compiled,
    })

    const options = JSON.stringify({ ...hotOptions, preserveLocalState })

    const adapterImport = adapter || resolveAdapterImport(hotOptions)

    const hotApiImport = resolveHotApiImport(hotOptions, hotApi)

    const { cssId, nonCssHash } = parseCssId(
      compiledCode,
      hotOptions.injectCss,
      originalCode,
      compileOptions && compileOptions.css
    )

    const replacement = renderApplyHmr({
      id,
      cssId,
      nonCssHash,
      hotOptions,
      options,
      hotApiImport,
      adapterImport,
      importAdapterName,
      meta,
      acceptable: isAcceptable(hotOptions, compileOptions, compiled),
      // CSS is handled outside of Svelte: don't temper with it!
      ignoreCss: compileOptions && compileOptions.css === false,
    })

    return compiledCode.replace(
      /(\n?export default ([^;]*);)/,
      (match, $1, $2) => {
        return replacement.replace(/\$2/g, () => $2)
      }
    )
  }

  // rollup-plugin-svelte-hot needs hotApi path (for tests)
  makeHot.hotApi = hotApi

  return makeHot
}

module.exports = createMakeHot
