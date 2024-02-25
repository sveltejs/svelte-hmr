import { test, hmr, clickButton } from '$test'

test(
  'preserves event callbacks when observed component (child) is updated',
  hmr([
    {
      files: {
        'App.svelte': `

          <script>
            import Child from './Child.svelte'

            let value = 0

            const onClick = () => {
              value = value + 1
            }
          </script>

          <Child on:click={onClick} />

          {value}
        `,
        'Child.svelte': ({ text }) => `
          <button on:click />
          ${text ?? ''}
        `,
      },
    },
    {
      name: 'callback is working',
      steps: [
        { expect: '<button></button> 0' },
        clickButton(),
        { expect: '<button></button> 1' },
      ],
    },
    {
      name: 'callback is attached to new (version of) component',
      edit: {
        'Child.svelte': { text: 'updated' },
      },
      steps: [
        { expect: '<button></button> updated 1' },
        clickButton(),
        { expect: '<button></button> updated 2' },
      ],
    },
  ])
)
