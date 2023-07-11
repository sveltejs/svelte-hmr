import { describe, test, hmr } from '$test'

describe.only('accessors: true', () => {
  test(
    'reloads components with <svelte:options accessors />',
    hmr([
      {
        files: {
          '../vite.config.js': `
            import { svelte } from '@sveltejs/vite-plugin-svelte'
            import { defineConfig } from 'vite'

            export default defineConfig({
              plugins: [svelte({
                hot: {
                  acceptAccessors: false
                }
              })],
            })
          `,
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
              let child
              $: {
                console.log(child)
                debugger
              }
            </script>

            <Child bind:this={child} />

            <span>{(child?.bar || child?.foo)}</span>
          `,
          'Child.svelte': ({ script, text }) => `
            <svelte:options accessors={true} />

            <script>
              ${script ?? "export const foo = 'bar'"}
            </script>

            ${text ?? 'I have accessors.'}
          `,
        },
        expect: 'I have accessors. <span>bar</span>',
      },
      {
        name: 'module script changes',
        edit: {
          'Child.svelte': {
            script: "export const bar = 'baz'",
            text: 'I still have accessors.',
          },
        },
        expect: 'I still have accessors. <span>baz</span>',
      },
    ])
  )
})
