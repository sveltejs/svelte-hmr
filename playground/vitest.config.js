import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

import { isKeep } from './config.js'

const timeout = process.env.CI ? 50000 : isKeep ? 0 : 30000

export default defineConfig({
  resolve: {
    alias: {
      $test: resolve(__dirname, './test-util.js'),
    },
  },
  test: {
    testTimeout: timeout,
    hookTimeout: timeout,
    globalSetup: ['./vitestGlobalSetup.js'],
    setupFiles: ['./vitestSetup.js'],
  },
})
