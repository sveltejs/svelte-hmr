import { test, assert } from 'vitest'

test('sanity check', async ({ start }) => {
  const { page } = await start()
  const body = await page.$('body')
  assert.equal(await body.innerText(), 'All good')
})
