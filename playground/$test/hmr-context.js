import fs from 'fs-extra'
import path from 'node:path'
import { chromium } from 'playwright-chromium'
import { createServer, loadConfigFromFile, mergeConfig } from 'vite'

import { wsEndpoint, tmpPlaygroundDir } from '../vitestSetup.js'
import { PLAYGROUND_DIR, isKeep } from './config.js'
import { call, randomId, normalizeHtml } from './util.js'

/** @param {import('vitest').TestContext} ctx */
export const initHmrTest = (ctx) => {
  const projectDirName = path.dirname(ctx.task.file.name)
  const testFileName = path
    .basename('basic/bindings.spec.js')
    .replace(/\.(?:spec|test)\.js$/, '')
  const projectDir = path.resolve(PLAYGROUND_DIR, projectDirName)
  const projectTmpDir = path.resolve(
    tmpPlaygroundDir,
    `${projectDirName}-${testFileName}-${randomId()}`
  )

  const initFixtures = async () => {
    await fs.mkdir(projectTmpDir)
    await fs.copy(projectDir, projectTmpDir, {
      /** @param {string} item */
      filter: (item) => !item.endsWith('.spec.js'),
    })

    return {
      close: async () => {
        await fs.remove(projectTmpDir)
      },
    }
  }

  const initServer = async () => {
    const options = {
      root: projectTmpDir,
      logLevel: 'silent',
      server: {
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
        // host: true,
        // fs: {
        //   strict: !isBuild,
        // },
      },
    }
    const config = await loadConfigFromFile(
      { command: 'serve', mode: 'development' },
      undefined,
      projectTmpDir
    )
    const testConfig = mergeConfig(options, config || {})

    const server = await createServer(testConfig)

    await server.listen()

    if (isKeep) {
      server.printUrls()
    }

    const baseUrl = server.resolvedUrls.local[0]

    return {
      server,
      baseUrl,
      close: async () => {
        await server.close()
      },
    }
  }

  const initBrowser = async () => {
    const browser = await chromium.connect(wsEndpoint, {
      ...(process.env.OPEN && {
        slowMo: 100,
      }),
    })

    const page = await browser.newPage()

    return {
      page,
      close: async () => {
        await browser?.close()
      },
    }
  }

  const cleanups = []

  /**
   * @param {{
   *   files?: Record<string, string>
   *   exposeFunction?: Record<string, function>
   * }} [options]
   */
  const start = async ({ files, exposeFunction } = {}) => {
    const { close: closeFixtures } = await initFixtures()

    /**
     * @param {string} file
     * @param {string | ((code: string) => string)} contents
     */
    const write = async (file, contents) => {
      const filePath = path.resolve(projectTmpDir, file)

      if (typeof contents === 'function') {
        const code = await fs.readFile(filePath, 'utf8')
        contents = contents(code)
      }

      await fs.writeFile(filePath, contents, 'utf8')
    }

    if (files) {
      await Promise.all(
        Object.entries(files).map(([file, contents]) => write(file, contents))
      )
    }

    const { baseUrl, close: closeServer } = await initServer()

    const { page, close: closeBrowser } = await initBrowser()

    if (exposeFunction) {
      for (const [name, fn] of Object.entries(exposeFunction)) {
        await page.exposeFunction(name, fn)
      }
    }

    await page.goto(baseUrl)

    if (isKeep) {
      cleanups.push(async () => {
        await new Promise(() => {})
      })
    } else {
      cleanups.push(closeFixtures, closeServer, closeBrowser)
    }

    /** @param {string} file */
    const getFileUrl = (file) => `/${file}`

    /**
     * @param {string} file
     * @param {string | ((code: string) => string)} contents
     */
    const edit = async (file, contents) => {
      const updatedPromise = new Promise((resolve) => {
        // FIXME?
        const updateMessage = `[vite] hot updated: ${getFileUrl(file)}`
        /** @param {import('playwright-chromium').ConsoleMessage} msg */
        const handleConsole = (msg) => {
          // if (msg.text() === updateMessage) {
          if (msg.text().startsWith('[vite] hot updated: ')) {
            page.off('console', handleConsole)
            resolve()
          }
        }
        page.on('console', handleConsole)
      })

      await write(file, contents)

      await updatedPromise
    }

    const bodyHTML = async () => {
      const body = await page.$('body')
      return normalizeHtml(await body.innerHTML())
    }

    return { page, write, edit, bodyHTML }
  }

  const stop = async () => {
    await Promise.all(cleanups.map(call))
  }

  return { start, stop }
}
