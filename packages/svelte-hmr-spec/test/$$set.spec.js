const { clickButton } = require('./helpers')

describe('$$set', () => {
  testHmr`
    # preserves local state when component changes

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
      let child
      const increment = () => {
        child.$set({
          x: child.get() + 1
        })
      }
    </script>

    <button on:click={increment} />

    <Child bind:this={child} />

    --- Child.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      export let x = 0

      export const get = () => x
    </script>

    <x-focus>
      ::0 before: {x}
      ::1 after: {x}
    </x-focus>

    * * * * *

    ::0::
      before: 0
      ${clickButton()}
      before: 1
    ::1::
      after: 1
  `
})
