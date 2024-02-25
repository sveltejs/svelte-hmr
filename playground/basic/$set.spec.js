import { test, hmr, clickButton } from '$test'

test(
  'preserves local state when component changes',
  hmr([
    {
      files: {
        'App.svelte': `
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
        `,
        'Child.svelte': ({ x }) => `
          <!-- @hmr:keep-all -->

          <script>
            export let x = 0

            export const get = () => x
          </script>

          <x-focus>
            ${x ?? 'before: {x}'}
          </x-focus>
        `,
      },
      steps: [
        { expect: { 'x-focus': 'before: 0' } },
        clickButton(),
        { expect: { 'x-focus': 'before: 1' } },
      ],
    },
    {
      name: 'edit child',
      edit: {
        'Child.svelte': { x: 'after: {x}' },
      },
      expect: {
        'x-focus': 'after: 1',
      },
    },
  ])
)
