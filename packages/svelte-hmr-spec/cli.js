#!/usr/bin/env node

const path = require('path')

const impørt = require('esm')(module)

const { run } = impørt('test-hmr/lib/cli')

run(() => path.resolve(__dirname, 'thc.config.js'))
