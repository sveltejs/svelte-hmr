const { clickButton } = require('./helpers')

describe('callbacks', () => {
  testHmr`
    # preserves event callbacks when observed component (child) is updated

    ----- App.svelte -----

    <script>
      import Child from './Child.svelte'

      let value = 0

      const onClick = () => {
        value = value + 1
      }
    </script>

    <Child on:click={onClick} />

    {value}

    ----- Child.svelte -----

    <button on:click />

    ::0
    ::1 updated

    * * * * * * * *

    <button></button>

    ::0:: callback is working

      0
      ${clickButton()}
      1

    ::1:: callback is attached to new (version of) component

      updated 1
      ${clickButton()}
      updated 2
  `
})
