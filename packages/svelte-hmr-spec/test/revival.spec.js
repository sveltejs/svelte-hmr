describe('revival after error', () => {
  testHmr`
    # revives after


    ---- App.svelte ----

    <script>
      ::0 const key = 'foo'
      ::1
      ::2 const key = 'bar'
    </script>

    ::0 <p data-focus>{key}</p>
    ::1 <p data-focus>{key}</p>
    ::2 <p data-focus>{key}</p>

    *****

    ::0::
      foo
      ${function*() {
        yield this.cons.ignoreErrors()
      }}
    ::1::
      ${function*() {
        yield this.cons.ignoreErrors(false)
      }}
    ::2 bar
  `
})
