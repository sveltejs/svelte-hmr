import { describe, test, hmr, clickButton } from '$test'

describe('<svelte:component />', () => {
  test(
    "updates when 'this' component changes",
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <svelte:component this={Child} name="kid" />
          `,
          'Child.svelte': ({ text }) => `
            <script>
              export let name
            </script>

            <div data-focus>
              ${text ?? '{name}'}
            </div>
          `,
        },
        expect: { '[data-focus]': 'kid' },
      },
      {
        name: 'change',
        edit: {
          'Child.svelte': {
            text: 'Name: {name}',
          },
        },
        expect: { '[data-focus]': 'Name: kid' },
      },
    ])
  )

  test(
    "updates when 'this' component changes in if blocks",
    hmr([
      {
        files: {
          'App.svelte': `
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
          `,
          'Child.svelte': ({ text }) => `
            <script>
              export let name
            </script>

            <div data-focus>
              ${text ?? '{name}'}
            </div>
          `,
        },
        steps: [
          { expect: { '[data-focus]': 'kid' } },
          clickButton(),
          { expect: { '[data-focus]': 'alt' } },
        ],
      },
      {
        name: 'change',
        edit: {
          'Child.svelte': {
            text: 'Name: {name}',
          },
        },
        steps: [
          { expect: { '[data-focus]': 'Name: alt' } },
          clickButton(),
          { expect: { '[data-focus]': 'Name: kid' } },
        ],
      },
    ])
  )
})
