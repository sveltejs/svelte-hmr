const createMakeHotFactory = require('./lib/make-hot.js')
const { resolve } = require('path')

const resolveRuntimeImport = (absoluteImports, target) => {
  const base = absoluteImports
    ? resolve(__dirname, 'runtime') + '/'
    : 'svelte-hmr/runtime/'
  return base + target
}

const createMakeHot = createMakeHotFactory({ resolveRuntimeImport })

module.exports = { createMakeHot }
