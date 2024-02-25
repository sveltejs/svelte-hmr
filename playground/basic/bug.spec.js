import { test, hmr, clickButton, wait } from '$test'

test(
  'bug in my sapper app',
  hmr([
    {
      files: {
        'App.svelte': `
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
        `,
        'Child.svelte': ({ code }) => `
          <script>
            import {fade} from 'svelte/transition'
            export let name
            let visible = true
          </script>

          <div out:fade={{duration: 5}}>
            <x-focus>
              {#if visible}
                ${code ?? '{name}'}
              {/if}
            </x-focus>
          </div>
        `,
      },
      steps: [
        { expect: { 'x-focus': 'first' } },
        clickButton(),
        wait(100),
        { expect: { 'x-focus': 'alt' } },
      ],
    },
    {
      name: 'child changes',
      edit: {
        'Child.svelte': { code: 'Name: {name}' },
      },
      expect: {
        'x-focus': 'Name: alt',
      },
    },
  ])
)
