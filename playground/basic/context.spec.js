import { test, hmr } from '$test'

test(
  'preserves context when parent is updated',
  hmr([
    {
      files: {
        'App.svelte': ({ setContext }) => `
          <script>
            import { setContext } from 'svelte'
            import Child from './Child.svelte'
            ${setContext ?? "setContext('name', 'foo')"}
          </script>

          <Child />
        `,
        'Child.svelte': `
          <script>
            import { getContext } from 'svelte'
            const name = getContext('name')
          </script>

          I am {name}
        `,
      },
      expect: 'I am foo',
    },
    {
      name: 'parent changes',
      edit: {
        'App.svelte': { setContext: "setContext('name', 'bar')" },
      },
      expect: 'I am bar',
    },
  ])
)

test(
  'preserves context when child is updated',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import { setContext } from 'svelte'
            import Child from './Child.svelte'
            setContext('name', 'foo')
          </script>

          <Child />
        `,
        'Child.svelte': ({ text }) => `
          <script>
            import { getContext } from 'svelte'
            const name = getContext('name')
          </script>

          ${text ?? 'I am {name}'}
        `,
      },
      expect: 'I am foo',
    },
    {
      name: 'child changes',
      edit: {
        'Child.svelte': { text: 'I am {name}!' },
      },
      expect: 'I am foo!',
    },
  ])
)

test(
  'preserves context when parent is updated, then child',
  hmr([
    {
      files: {
        'App.svelte': ({ setContext }) => `
          <script>
            import { setContext } from 'svelte'
            import Child from './Child.svelte'
            ${setContext ?? "setContext('name', 'foo')"}
          </script>

          <Child />
        `,
        'Child.svelte': ({ text }) => `
          <script>
            import { getContext } from 'svelte'
            const name = getContext('name')
          </script>

          ${text ?? 'I am {name}'}
        `,
      },
      expect: 'I am foo',
    },
    {
      name: 'parent changes',
      edit: {
        'App.svelte': { setContext: "setContext('name', 'bar')" },
      },
      expect: 'I am bar',
    },
    {
      name: 'child changes',
      edit: {
        'Child.svelte': { text: 'I am {name}!' },
      },
      expect: 'I am bar!',
    },
  ])
)
