const createMakeHotFactory = require('./lib/make-hot.js')
const { resolve } = require('path')

const resolveAbsoluteImport = target => resolve(__dirname, target)

const createMakeHot = createMakeHotFactory({ resolveAbsoluteImport })

module.exports = { createMakeHot }
