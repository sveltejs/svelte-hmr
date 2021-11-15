const { page } = require('test-hmr/commands')

describe('lifecycle', () => {
  testHmr`
    # onMount

    ${function*() {
      for (const fn of ['mounted', 'unmounted']) {
        this[fn] = sinon.fake()
        yield page.exposeFunction(fn, this[fn])
      }
    }}

    --- App.svelte ---

    <script>
      import { onMount } from 'svelte'

      onMount(() => {
        mounted()
        return () => {
          unmounted()
        }
      })
    </script>

    ::0 foo
    ::1 bar
    ::2 baz

    * * *

    ::0::

      foo

      ${function*() {
        expect(this.mounted).to.have.been.calledOnce
        expect(this.unmounted).to.not.have.been.called
      }}

    ::1::

      bar

      ${function*() {
        expect(this.mounted).to.have.been.calledTwice
        expect(this.unmounted).to.have.been.calledOnce
      }}
      
    ::2::

      baz

      ${function*() {
        expect(this.mounted).to.have.been.calledThrice
        expect(this.unmounted).to.have.been.calledTwice
      }}
      
  `
})
