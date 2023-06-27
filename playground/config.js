import os from 'node:os'
import path from 'node:path'

export const GLOBAL_DIR = path.join(os.tmpdir(), 'svelte-hmr_global_setup')

export const WS_ENDPOINT_FILE = path.join(GLOBAL_DIR, 'wsEndpoint')

export const GLOBAL_STATE_FILE = path.join(GLOBAL_DIR, 'global_state.json')

export const ROOT_DIR = path.resolve(__dirname, '..')

export const PLAYGROUND_DIR = path.resolve(ROOT_DIR, 'playground')

export const isCI = !!process.env.CI
export const isKeep = !!process.env.KEEP
export const isOpen = !!process.env.OPEN
