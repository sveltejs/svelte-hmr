describe('transform regex', () => {
  // https://github.com/rixo/svelte-hmr/issues/34
  testHmr`
    # doesn't catch export default in string

    --- App.svelte ---

    <code>
      {"const product = 1 * 1; export default product;"}
    </code>

    * * *

    ::0::
    <code>
      const product = 1 * 1; export default product;
    </code>
  `
})
