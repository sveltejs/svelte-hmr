import { test, hmr, clickButton } from '$test'

test(
  'preserves position of reordered child items when child updates',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import Child from './Child.svelte'
            let items = [
              {id: 1, text: 'foo'},
              {id: 2, text: 'bar'},
            ]
            const reverseItems = () => {
              items = items.reverse()
            }
          </script>

          <button on:click={reverseItems} />

          <x-focus>
            {#each items as item (item.id)}
              <Child text={item.text} />
            {/each}
          </x-focus>
        `,
        'Child.svelte': ({ text }) => `
          <script>
            export let text
          </script>

          ${text ?? '-{text}-'}
        `,
      },
      steps: [
        { expect: { 'x-focus': '-foo--bar-' } },
        clickButton(),
        { expect: { 'x-focus': '-bar--foo-' } },
      ],
    },
    {
      name: 'child changes',
      edit: {
        'Child.svelte': { text: '={text}=' },
      },
      expect: { 'x-focus': '=bar==foo=' },
    },
  ])
)
