import { describe, test, hmr } from '$test'

describe('simultaneous update parent & child', () => {
  test(
    'renders last version of everything',
    hmr([
      {
        files: {
          'a.js': ({ code }) => code ?? 'export default x => x',
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
              import wrap from './a'
            </script>

            <Child name={wrap('child')} />
          `,
          'Child.svelte': `
            <script>
              import { fade } from 'svelte/transition'
              import wrap from './a'
              export let name
            </script>

            <div out:fade>
              <x-focus>
                {wrap('I am ' + name)}
              </x-focus>
            </div>
          `,
        },
        expect: {
          'x-focus': 'I am child',
        },
      },
      {
        name: 'change',
        edit: {
          'a.js': {
            code: "export default x => x + '!'",
          },
        },
        expect: {
          'x-focus': 'I am child!!',
        },
      },
    ])
  )
})
