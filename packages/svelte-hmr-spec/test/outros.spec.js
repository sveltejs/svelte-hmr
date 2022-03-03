const { page, wait } = require('test-hmr/commands')

const isCI = process.env.CI === 'true'

describe('outros', () => {
  testHmr`
    # updates when component contains an element with an outro

    --- App.svelte ---

    <script>
      import { fade } from 'svelte/transition'
    </script>

    <div out:fade={{ duration: 5 }} data-focus>
      ::0 Zer0
      ::1 1ne
    </div>

    * * * * * * * *

    ::0 Zer0
    ::1 1ne
  `

  testHmr`
    # updates when a child component contains an element with an outro

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <Child />

    --- Child.svelte ---

    <script>
      import { fade } from 'svelte/transition'
    </script>

    <div out:fade={{ duration: 5 }} data-focus>
      ::0 Zer0
      ::1 1ne
    </div>

    * * * * * * * *

    ::0 Zer0
    ::1 1ne
  `

  testHmr`
    # updates when a child component contains an element with an outro that has run

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <Child />

    --- Child.svelte ---

    <script>
      '@!hmr'
      import { fade } from 'svelte/transition'

      let visible = true

      const toggle = () => visible = !visible
    </script>

    {#if visible}
      <div out:fade={{ duration: 5 }} data-focus on:click={toggle}>
        ::0 Zer0
        ::1 1ne
      </div>
    {:else}
      wait for it...
    {/if}

    * * * * * * * *

    ::0::

      Zer0

      ${function*() {
        yield page.click('div')
        yield wait(isCI ? 200 : 20)
      }}

      wait for it...

    ::1 1ne
  `

  testHmr`
    # updates when a child component contains an element with an outro that is running

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <Child />

    --- Child.svelte ---

    <script>
      '@!hmr'
      import { fade } from 'svelte/transition'

      let visible = true

      const toggle = () => visible = !visible
    </script>

    {#if visible}
      <div out:fade={{ duration: 20 }} data-focus on:click={toggle}>
        ::0 Zer0
        ::1 1ne
      </div>
    {:else}
      wait for it...
    {/if}

    * * * * * * * *

    ::0::

      Zer0

      ${function*() {
        yield page.click('div')
        yield wait(1)
      }}

    ::1 1ne
  `
})
