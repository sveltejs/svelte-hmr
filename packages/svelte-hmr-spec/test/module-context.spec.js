// TODO need a way to test rollup options
describe.skip('context="module"', () => {
  testHmr`
    # reloads components with <svelte:options accessors />

    --- App.svelte ---

    <script>
      import Child, { foo } from './Child.svelte'

      let child
      $: if (child) {
        debugger
      }
    </script>

    <Child bind:this={child} />

    <span>{foo}</span>

    --- Child.svelte ---

    <script context="module">
      // @!hmr
      ::0 export const foo = 'bar'
      ::1 export const foo = 'baz'
    </script>

    I have module context

    * * *

    ::0 I have module context <span>bar</span>
    ::1 I have module context <span>baz</span>
  `
})
