import svelte from 'rollup-plugin-svelte-hot'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import hmr, { autoCreate } from 'rollup-plugin-hot'
import rollup_start_dev from './rollup_start_dev'
import * as fs from 'fs'

const test = process.env.NODE_ENV === 'test'
const watch = !!process.env.ROLLUP_WATCH
const isNollup = !!process.env.NOLLUP
const useLiveReload = !!process.env.LIVERELOAD

const dev = watch || isNollup || useLiveReload
const production = !dev

const hot = isNollup || (watch && !useLiveReload)

const noPreserveState = !!process.env.NO_PRESERVE_STATE

const root = fs.realpathSync(__dirname)

const abs = p => root + '/' + p

// mute Nollup compiled output
if (process.env.MUTE_NOLLUP !== '0') {
  const { log } = console
  // eslint-disable-next-line no-console
  console.log = (...args) => {
    if (String(args[1]).startsWith('[Nollup] Compiled in')) return
    return log.apply(console, args)
  }
}

export default {
  input: abs`src/main.js`,
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write(isNollup ? 'build/bundle.css' : 'bundle.css')
      },
      accessors: true,
      hot: hot && {
        // expose test hooks from the plugin
        test,
        // optimistic will try to recover from runtime
        // errors during component init
        optimistic: true,
        // turn on to disable preservation of local component
        // state -- i.e. non exported `let` variables
        noPreserveState,
      },
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve({
      browser: true,
      // rollup-plugin-svelte-hot automatically resolves & dedup svelte
    }),
    commonjs(),

    // In dev mode, call `npm run start:dev` once
    // the bundle has been generated
    !production && !test && !isNollup && rollup_start_dev,

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    useLiveReload && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    // Automatically create missing imported files. This helps keeping
    // the HMR server alive, because Rollup watch tends to crash and
    // hang indefinitely after you've tried to import a missing file.
    hot &&
      autoCreate({
        include: 'src/**/*',
        // Set false to prevent recreating a file that has just been
        // deleted (Rollup watch will crash when you do that though).
        recreate: true,
      }),

    hot &&
      hmr({
        public: abs`public`,
        inMemory: true,
      }),
  ],
  watch: {
    clearScreen: false,
  },
}
