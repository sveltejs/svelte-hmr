import { describe, test, hmr, click, wait, isCI } from '$test'

describe('outros', () => {
  test(
    'updates when component contains an element with an outro',
    hmr([
      {
        files: {
          'App.svelte': ({ text }) => `
            <script>
              import { fade } from 'svelte/transition'
            </script>

            <div out:fade={{ duration: 5 }} data-focus>
              ${text ?? 'Zer0'}
            </div>
          `,
        },
        expect: {
          '[data-focus]': 'Zer0',
        },
      },
      {
        name: 'component changes',
        edit: {
          'App.svelte': {
            text: '1ne',
          },
        },
        expect: {
          '[data-focus]': '1ne',
        },
      },
    ])
  )

  test(
    'updates when a child component contains an element with an outro',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <Child />
          `,
          'Child.svelte': ({ text }) => `
            <script>
              import { fade } from 'svelte/transition'
            </script>

            <div out:fade={{ duration: 5 }} data-focus>
              ${text ?? 'Zer0'}
            </div>
          `,
        },
        expect: {
          '[data-focus]': 'Zer0',
        },
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            text: '1ne',
          },
        },
        expect: {
          '[data-focus]': '1ne',
        },
      },
    ])
  )

  test.skipIf(isCI)(
    'updates when a child component contains an element with an outro that has run',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <Child />
          `,
          'Child.svelte': ({ text }) => `
            <script>
              '@!hmr'
              import { fade } from 'svelte/transition'

              let visible = true

              const toggle = () => visible = !visible
            </script>

            {#if visible}
              <div out:fade={{ duration: 5 }} data-focus on:click={toggle}>
                ${text ?? 'Zer0'}
              </div>
            {:else}
              wait for it...
            {/if}
          `,
        },
        steps: [
          { expect: { '[data-focus]': 'Zer0' } },
          click('div'),
          wait(isCI ? 200 : 20),
          { expect: 'wait for it...' },
        ],
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            text: '1ne',
          },
        },
        steps: [
          {
            expect: { '[data-focus]': '1ne' },
          },
        ],
      },
    ])
  )

  test(
    'updates when a child component contains an element with an outro that is running',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <Child />
          `,
          'Child.svelte': ({ text }) => `
            <script>
              '@!hmr'
              import { fade } from 'svelte/transition'

              let visible = true

              const toggle = () => visible = !visible
            </script>

            {#if visible}
              <div out:fade={{ duration: 20 }} data-focus on:click={toggle}>
                ${text ?? 'Zer0'}
              </div>
            {:else}
              wait for it...
            {/if}
          `,
        },
        steps: [{ expect: { '[data-focus]': 'Zer0' } }, click('div'), wait(1)],
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            text: '1ne',
          },
        },
        expect: {
          '[data-focus]': '1ne',
        },
      },
    ])
  )
})
