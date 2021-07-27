const path = require('path')
const fs = require('fs')
const { bootstrap, config } = require('test-hmr')

const { appPath } = config

if (appPath) {
  const possibleLocations = [
    () => path.resolve(fs.realpathSync(appPath), 'node_modules', 'svelte'),
    () =>
      path.resolve(fs.realpathSync(__dirname), '..', 'node_modules', 'svelte'),
  ]
  const found = possibleLocations.some(getPath => {
    try {
      const sveltePath = getPath()
      if (fs.existsSync(sveltePath)) {
        const { version } = require(path.join(sveltePath, 'package.json'))
        process.env.SVELTE = sveltePath
        // eslint-disable-next-line no-console
        console.log(`[SVHS] Use Svelte v${version}: ${sveltePath}`)
        return true
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  })
  if (!found) {
    const call = fn => fn()
    // eslint-disable-next-line no-console
    console.warn(
      'Failed to find Svelte install. Tried locations:\n' +
        possibleLocations
          .map(call)
          .map(loc => '- ' + loc)
          .join('\n')
    )
  }
}

bootstrap()
