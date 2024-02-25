import { describe, test, hmr } from '$test'

describe('module="context"', () => {
  test(
    'reloads components with <svelte:options accessors />',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child, { foo } from './Child.svelte'

              let child
              $: if (child) {
                debugger
              }
            </script>

            <Child bind:this={child} />

            <span>{foo}</span>
          `,
          'Child.svelte': ({ moduleScript }) => `
            <script context="module">
              ${moduleScript ?? "export const foo = 'bar'"}
            </script>

            I have module context
          `,
        },
        expect: 'I have module context <span>bar</span>',
      },
      {
        name: 'module script changes',
        edit: {
          'Child.svelte': { moduleScript: "export const foo = 'baz'" },
        },
        expect: 'I have module context <span>baz</span>',
      },
    ])
  )
})
