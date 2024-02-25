import { describe, test, hmr } from '$test'

describe('transform regex', () => {
  // https://github.com/rixo/svelte-hmr/issues/34
  test(
    "doesn't catch export default in string",
    hmr([
      {
        files: {
          'App.svelte': `
            <code>
              {"const product = 1 * 1; export default product;"}
            </code>
          `,
        },
        expect: `
          <code>
            const product = 1 * 1; export default product;
          </code>
        `,
      },
    ])
  )
})
