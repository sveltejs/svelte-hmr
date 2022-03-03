const { page } = require('test-hmr/commands')

describe('bundler', () => {
  // This is mainly a sanity check for HMR tests.
  //
  // It ensures that the configured HMR done message is really triggered when
  // the whole HMR update has completed, including async accept handlers.
  //
  testHmr`
    # has completely applied HMR update on done message

    ${function*() {
      this.done = sinon.fake()
      yield page.exposeFunction('done', this.done)
    }}

    --- App.svelte ---

    <script>
      ::0
      ::1 done('yay')
    </script>

    * * * * *

    ::0::
    ::1::
      ${function*() {
        expect(this.done).to.have.been.calledOnceWith('yay')
      }}
  `
})
