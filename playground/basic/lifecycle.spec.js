import { test, hmr, vi, expect } from '$test'

test(
  'onMount',
  hmr(() => {
    const mounted = vi.fn()
    const unmounted = vi.fn()

    return [
      {
        exposeFunction: { mounted, unmounted },
        files: {
          'App.svelte': ({ text }) => `
            <script>
              import { onMount } from 'svelte'

              onMount(() => {
                mounted()
                return () => {
                  unmounted()
                }
              })
            </script>

            ${text ?? 'foo'}
          `,
        },
        steps: [
          { expect: 'foo' },
          () => {
            expect(mounted).toHaveBeenCalledOnce()
            expect(unmounted).not.toHaveBeenCalled()
          },
        ],
      },
      {
        name: 'first change',
        edit: {
          'App.svelte': { text: 'bar' },
        },
        steps: [
          { expect: 'bar' },
          () => {
            expect(mounted).toHaveBeenCalledTimes(2)
            expect(unmounted).toHaveBeenCalledOnce()
          },
        ],
      },
      {
        name: 'second change',
        edit: {
          'App.svelte': { text: 'baz' },
        },
        steps: [
          { expect: 'baz' },
          () => {
            expect(mounted).toHaveBeenCalledTimes(3)
            expect(unmounted).toHaveBeenCalledTimes(2)
          },
        ],
      },
    ]
  })
)
