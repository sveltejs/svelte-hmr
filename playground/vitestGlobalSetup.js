import { chromium } from 'playwright-chromium'
import fs from 'fs-extra'
import path from 'node:path'

import {
  ROOT_DIR,
  GLOBAL_DIR,
  WS_ENDPOINT_FILE,
  GLOBAL_STATE_FILE,
  PLAYGROUND_DIR,
  isOpen,
  isCI,
} from './$test/config.js'
import { call, randomId } from './$test/util.js'

const TMP_PLAYGROUND_DIR = process.env.TMP_PLAYGROUND_DIR
  ? path.resolve(ROOT_DIR, process.env.TMP_PLAYGROUND_DIR)
  : path.join(ROOT_DIR, `playground-${randomId()}`)

const initBrowserServer = async () => {
  const browserServer = await chromium.launchServer({
    headless: !isOpen,
    devtools: isOpen,
    args: isCI ? ['--no-sandbox', '--disable-setuid-sandbox'] : undefined,
  })

  await fs.writeFile(WS_ENDPOINT_FILE, browserServer.wsEndpoint())

  return async () => {
    await browserServer?.close()
  }
}

const initGlobalState = async () => {
  const data = JSON.stringify({
    tmpPlaygroundDir: TMP_PLAYGROUND_DIR,
  })
  await fs.writeFile(GLOBAL_STATE_FILE, data, 'utf8')
  return async () => {
    await fs.remove(GLOBAL_STATE_FILE)
  }
}

const initFixtures = async () => {
  await fs.mkdirp(TMP_PLAYGROUND_DIR)

  const nodeModulesDir = path.resolve(PLAYGROUND_DIR, 'node_modules')

  await fs.copy(PLAYGROUND_DIR, TMP_PLAYGROUND_DIR, {
    // keep all files + node_modules directory
    /** @param {string} item */
    filter: (item) =>
      item === PLAYGROUND_DIR ||
      item.includes('.') ||
      item === nodeModulesDir ||
      item.startsWith(nodeModulesDir + '/'),
  })

  return async () => {
    if (process.env.TMP_PLAYGROUND_DIR) {
      await fs.emptyDir(TMP_PLAYGROUND_DIR)
    } else {
      await fs.remove(TMP_PLAYGROUND_DIR)
    }
  }
}

const inits = [initGlobalState, initBrowserServer, initFixtures]

/** @type {(() => Promise<void>)[]} */
let cleanups

export const setup = async () => {
  await fs.mkdirp(GLOBAL_DIR)

  cleanups = (await Promise.all(inits.map(call))).filter(Boolean)
}

export const teardown = async () => {
  await Promise.all(cleanups.map(call))
}
