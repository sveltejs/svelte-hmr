describe('context', () => {
  testHmr`
    # preserves context when parent is updated

    --- App.svelte ---

    <script>
      import { setContext } from 'svelte'
      import Child from './Child.svelte'
      ::0 setContext('name', 'foo')
      ::1 setContext('name', 'bar')
    </script>

    <Child />

    --- Child.svelte ---

    <script>
      import { getContext } from 'svelte'
      const name = getContext('name')
    </script>

    I am {name}

    * * *

    ::0 I am foo
    ::1 I am bar
  `

  testHmr`
    # preserves context when child is updated

    --- App.svelte ---

    <script>
      import { setContext } from 'svelte'
      import Child from './Child.svelte'
      setContext('name', 'foo')
    </script>

    <Child />

    --- Child.svelte ---

    <script>
      import { getContext } from 'svelte'
      const name = getContext('name')
    </script>

    ::0 I am {name}
    ::1 I am {name}!

    * * *

    ::0 I am foo
    ::1 I am foo!
  `

  testHmr`
    # preserves context when parent is updated, then child

    --- App.svelte ---

    <script>
      import { setContext } from 'svelte'
      import Child from './Child.svelte'
      ::0 setContext('name', 'foo')
      ::1 setContext('name', 'bar')
    </script>

    <Child />

    --- Child.svelte ---

    <script>
      import { getContext } from 'svelte'
      const name = getContext('name')
    </script>

    ::0 I am {name}
    ::2 I am {name}!

    * * *

    ::0 I am foo
    ::1 I am bar
    ::2 I am bar!
  `
})
