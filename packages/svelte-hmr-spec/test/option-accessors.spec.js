// TODO need a way to test rollup options
describe.skip('accessors: true', () => {
  testHmr`
    # reloads components with <svelte:options accessors />

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
      let child
    </script>

    <Child bind:this={child} />

    <span>{child && (child.foo || child.bar)}</span>

    --- Child.svelte ---

    <svelte:options accessors />

    <script>
      // @!hmr
      ::0 export const foo = 'bar'
      ::1 export const bar = 'baz'
    </script>

    ::0 I have accessors.
    ::1 I still have accessors.

    * * *

    ::0 I have accessors. <span>bar</span>
    ::1 I still have accessors. <span>baz</span>
  `
})
