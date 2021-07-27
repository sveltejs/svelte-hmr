const { page } = require('test-hmr/commands')

describe('<svelte:component />', () => {
  testHmr`
    # updates when 'this' component changes

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <svelte:component this={Child} name="kid" />

    --- Child.svelte ---

    <script>
      export let name
    </script>

    <div data-focus>
      ::0 {name}
      ::1 Name: {name}
    </div>

    * * *

    ::0::
      kid
    ::1::
      Name: kid
  `

  testHmr`
    # updates when 'this' component changes in if blocks

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
      let alt = false
      const toggleAlt = () => {
        alt = !alt
      }
    </script>

    <button on:click={toggleAlt} />

    {#if alt}
      <svelte:component this={Child} name="alt" />
    {:else}
      <svelte:component this={Child} name="kid" />
    {/if}

    --- Child.svelte ---

    <script>
      export let name
    </script>

    <div data-focus>
      ::0 {name}
      ::1 Name: {name}
    </div>

    * * *

    ::0::
      kid
      ${function*() {
        yield page.click('button')
      }}
      alt
    ::1::
      Name: alt
      ${function*() {
        yield page.click('button')
      }}
      Name: kid
    ::
  `
})
