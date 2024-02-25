import { describe, test, hmr } from '$test'

describe.skip('revival after error', () => {
  test(
    'revival after error',
    hmr([
      {
        files: {
          'App.svelte': ({ script }) => `
            <script>
              ${script ?? "const key = 'foo'"}
            </script>

            {key}
          `,
        },
        expect: 'foo',
      },
      {
        name: '1',
        edit: {
          'App.svelte': {
            script: '',
          },
        },
        expect: '',
      },
      {
        name: '2',
        edit: {
          'App.svelte': {
            script: "const key = 'bar'",
          },
        },
        expect: 'bar',
      },
    ])
  )
})
