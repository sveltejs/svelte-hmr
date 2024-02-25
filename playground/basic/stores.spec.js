import { describe, test, hmr } from '$test'

describe('stores', () => {
  /**
   * $inject_state will try to `.set` the store if it is passed the subscribed
   * variable (e.g. `$x`). If the store is not writable, it will crash. If it is
   * writable... I'm not too sure but it doesn't necessarily seems good.
   */
  test(
    'does not crashes with non writtable stores subscriptions',
    hmr([
      {
        files: {
          'App.svelte': ({ markup }) => `
            <script>
              import { readable } from 'svelte/store'

              // it has to be a let (not a const!) for Svelte to instrument it
              let x = readable(42)

            </script>

            ${markup ?? '{$x}'}
          `,
        },
        expect: '42',
      },
      {
        name: 'change',
        edit: {
          'App.svelte': { markup: '>> {$x}' },
        },
        expect: '>> 42',
      },
    ])
  )
})
