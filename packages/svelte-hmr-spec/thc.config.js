import * as path from 'path'
import * as fs from 'fs'

const bootstrap = ({ appPath }) => {
  if (appPath) {
    const possibleLocations = [
      () => path.resolve(fs.realpathSync(appPath), 'node_modules', 'svelte'),
      () =>
        path.resolve(
          fs.realpathSync(__dirname),
          '..',
          'node_modules',
          'svelte'
        ),
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
}

// const resolveApp = name => path.dirname(require.resolve(`${name}/package.json`))
//
// const rollupAppPath = resolveApp('svelte-template-hot')

export default {
  bootstrap,
  files: 'test/**/*.spec.js',
  fixturesDir: path.resolve(__dirname, 'src.fixtures'),
  nollup: true, // NOTE only one working at time of change...
  // apps: {
  //   rollup: rollupAppPath,
  //   nollup: {
  //     path: rollupAppPath,
  //     nollup: true,
  //   },
  //   webpack: resolveApp('svelte-template-webpack-hot'),
  // },
}
