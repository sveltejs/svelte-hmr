import { describe, test, hmr, assert } from '$test'

describe('style', () => {
  test(
    'injects scoped style when component changes',
    hmr([
      {
        files: {
          'App.svelte': ({ css }) => `
            <style>
              h1 {
                ${css ?? 'color: rgb(16, 25, 34);'}
              }
            </style>

            <h1>I am Blue</h1>
          `,
        },
        steps: [
          async (page) => {
            const color = await page.$eval('h1', (el) =>
              window.getComputedStyle(el).getPropertyValue('color')
            )
            assert.equal(color, 'rgb(16, 25, 34)')
          },
        ],
      },
      {
        name: 'change',
        edit: {
          'App.svelte': { css: 'color: rgb(216, 225, 234);' },
        },
        steps: [
          async (page) => {
            const color = await page.$eval('h1', (el) =>
              window.getComputedStyle(el).getPropertyValue('color')
            )
            assert.equal(color, 'rgb(216, 225, 234)')
          },
        ],
      },
    ])
  )

  test(
    'applies child style when child changes',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <style>
              :global(h1) {
                color: red;
              }
            </style>

            <Child />
          `,
          'Child.svelte': ({ css }) => `
            <style>
              h1 {
                ${css ?? 'color: rgb(16, 25, 34);'}
              }
            </style>

            <h1>I am White</h1>
          `,
        },
        steps: [
          async (page) => {
            const color = await page.$eval('h1', (el) =>
              window.getComputedStyle(el).getPropertyValue('color')
            )
            assert.equal(color, 'rgb(16, 25, 34)')
          },
        ],
      },
      {
        name: 'change',
        edit: {
          'Child.svelte': { css: 'color: rgb(216, 225, 234);' },
        },
        steps: [
          async (page) => {
            const color = await page.$eval('h1', (el) =>
              window.getComputedStyle(el).getPropertyValue('color')
            )
            assert.equal(color, 'rgb(216, 225, 234)')
          },
        ],
      },
    ])
  )
})
