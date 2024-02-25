import { beforeAll } from 'vitest'
import fs from 'fs-extra'

import { GLOBAL_STATE_FILE, WS_ENDPOINT_FILE } from './$test/config.js'

export let wsEndpoint = ''

export let tmpPlaygroundDir = ''

const readGlobalConfig = async () => {
  const json = await fs.readFile(GLOBAL_STATE_FILE, 'utf8')
  return JSON.parse(json)
}

beforeAll(async () => {
  tmpPlaygroundDir = (await readGlobalConfig()).tmpPlaygroundDir

  wsEndpoint = await fs.readFile(WS_ENDPOINT_FILE, 'utf-8')

  if (!wsEndpoint) {
    throw new Error(`wsEndpoint file not found: ${WS_ENDPOINT_FILE}`)
  }
})
