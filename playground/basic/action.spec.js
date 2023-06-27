import { vi, assert, expect } from 'vitest'
import { test, hmr, replace } from '$test'

test(
  're-executes action when component changes',
  hmr([
    {
      files: {
        'App.svelte': ({ action }) => `
          <script>
            import { onMount } from 'svelte'
            ${action ?? "const action = node => node.innerText = 'touched'"}
          </script>

          <div use:action />
        `,
      },
      expect: '<div>touched</div>',
    },
    {
      name: 'action changed',
      edit: {
        'App.svelte': {
          action: "const action = node => node.innerText = 'touch touch'",
        },
      },
      expect: '<div>touch touch</div>',
    },
  ])
)

test(
  'executes destroy when component has changed',
  hmr(() => {
    const done = vi.fn()

    return [
      {
        exposeFunction: { done },
        files: {
          'App.svelte': ({ x }) => `
            <script>
              const action = node => {
                node.innerText = 'touched'
                return {
                  destroy() {
                    done('yay')
                  }
                }
              }
            </script>

           ${x ?? ''}

            <div use:action />
          `,
        },
        expect: '<div>touched</div>',
      },
      {
        name: 'edit',
        edit: {
          'App.svelte': { x: 'still' },
        },
        steps: [
          async () => {
            expect(done).toHaveBeenCalledWith('yay')
          },
          { expect: 'still <div>touched</div>' },
        ],
      },
    ]
  })
)
