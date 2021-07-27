/* global window */

const assert = require('assert')
const { page } = require('test-hmr/commands')

describe('style', () => {
  testHmr`
    # injects scoped style when component changes

    --- App.svelte ---

    <style>
      h1 {
        ::0::
        color: rgb(16, 25, 34);
        ::1::
        color: rgb(216, 225, 234);
        ::
      }
    </style>

    <h1>I am Blue</h1>

    * * * * *

    <h1>I am Blue</h1>

    ::0::
    ${function*() {
      const color = yield page.$eval('h1', el =>
        window.getComputedStyle(el).getPropertyValue('color')
      )
      assert.equal(color, 'rgb(16, 25, 34)')
    }}
    ::1::
    ${function*() {
      const color = yield page.$eval('h1', el =>
        window.getComputedStyle(el).getPropertyValue('color')
      )
      assert.equal(color, 'rgb(216, 225, 234)')
    }}
  `

  testHmr`
    # applies child style when child changes

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <style>
      :global(h1) {
        color: red;
      }
    </style>

    <Child />

    --- Child.svelte ---

    <style>
      h1 {
        ::0::
        color: rgb(16, 25, 34);
        ::1::
        color: rgb(216, 225, 234);
        ::
      }
    </style>

    <h1>I am White</h1>

    * * * * *

    <h1>I am White</h1>

    ::0::
    ${function*() {
      const color = yield page.$eval('h1', el =>
        window.getComputedStyle(el).getPropertyValue('color')
      )
      assert.equal(color, 'rgb(16, 25, 34)')
    }}
    ::1::
    ${function*() {
      const color = yield page.$eval('h1', el =>
        window.getComputedStyle(el).getPropertyValue('color')
      )
      assert.equal(color, 'rgb(216, 225, 234)')
    }}
  `
})
