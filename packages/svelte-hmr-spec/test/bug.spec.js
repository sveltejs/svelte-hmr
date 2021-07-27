const { page, wait } = require('test-hmr/commands')

describe('bug: missing insertion point with if + outros', () => {
  testHmr.skip`
    # bug in my sapper app

    --- App.svelte ---

    <script>
      import {fade} from 'svelte/transition'
      import Child from './Child.svelte'
      let first = true
      const toggleFirst = () => {first = !first}
    </script>

    <button id="first" on:click={toggleFirst} />

    {#if first}
      <svelte:component this={Child} name="first" />
    {:else}
      <svelte:component this={Child} name="alt" />
    {/if}

    --- Child.svelte ---

    <script>
      import {fade} from 'svelte/transition'
      export let name
      let visible = true
    </script>

    <div out:fade={{duration: 5}}>
      <x-focus>
        {#if visible}
          ::0 {name}
          ::1 Name: {name}
        {/if}
      </x-focus>
    </div>

    * * *

    ::0::

      first
      ${function*() {
        yield page.click('button')
        yield wait(50)
      }}
      alt

    ::1::

      Name: alt
  `
})
