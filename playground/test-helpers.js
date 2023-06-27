/** @typedef {import('playwright-chromium').Page} Page */

/**
 * @param {string} [selector]
 * @returns {(page: Page) => Promise<void>}
 */
export const clickButton =
  (selector = 'button') =>
  async (page) => {
    const button = await page.$(selector)
    await button.click()
  }

/**
 * @param {string} [selector]
 * @returns {(page: Page) => Promise<void>}
 */
export const clearInput =
  (selector = 'input') =>
  async (page) => {
    await page.focus(selector)
    const value = await page.inputValue(selector)
    const len = String(value).length
    for (let i = 0; i < len; i++) {
      await page.keyboard.press('Backspace')
    }
  }

/**
 * @param {string} value
 * @param {string} [selector]
 * @returns {(page: Page) => Promise<void>}
 */
export const replaceInputValue =
  (value, selector = 'input') =>
  async (page) => {
    await clearInput(selector)(page)
    await page.type(selector, value)
  }
