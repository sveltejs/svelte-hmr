const { page } = require('test-hmr/commands')

describe('action', () => {
  testHmr`
    # re-executes action when component changes

    --- App.svelte ---

    <script>
      import { onMount } from 'svelte'
      ::0 const action = node => node.innerText = 'touched'
      ::1 const action = node => node.innerText = 'touch touch'
    </script>

    <div use:action />

    * * * * *

    ::0::

      <div>touched</div>

    ::1::

      <div>touch touch</div>
  `

  testHmr`
    # executes destroy when component has changed

    ${function*() {
      this.done = sinon.fake()
      yield page.exposeFunction('done', this.done)
    }}

    --- App.svelte ---

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

    ::0
    ::1 still

    <div use:action />

    * * * * *

    ::0::

      <div>touched</div>

    ::1::

      ${function*() {
        expect(this.done).to.have.been.calledOnceWith('yay')
      }}

      still <div>touched</div>
  `
})
