describe('empty components', () => {
  testHmr`
    # does not crash when reloading an empty component

    --- App.svelte ---

    ::0
    ::1

    * * *

    ::0
    ::1
  `
})
