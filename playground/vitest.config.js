import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

import { isKeep } from './config.js'

export default defineConfig({
  resolve: {
    alias: {
      $test: resolve(__dirname, './test-util.js'),
    },
  },
  test: {
    testTimeout: isKeep ? 0 : 5000,
    globalSetup: ['./vitestGlobalSetup.js'],
    setupFiles: ['./vitestSetup.js'],
  },
})
