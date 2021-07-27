const { clickButton } = require('./helpers')

describe('local state', () => {
  testHmr`
    # preserves local state when component changes

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      let x = 0
      const increment = () => { x++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x}
      ::1 after: {x}
    </x-focus>

    * * * * *

    ::0::
      before: 0
      ${clickButton()}
      before: 1
    ::1::
      after: 1
  `

  testHmr`
    # preserves local variables in simpler component (no definition)

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0::
        let a = 'foo'
      ::1::
        let a = 'bar'
      :::::
    </script>

    {a}

    * * * * *

    ::0 foo
    ::1 foo
  `

  testHmr`
    # preserves value of props that become local

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0 export let a = 'foo'
      ::1 let a = 'bar'
    </script>

    {a}

    * * * * *

    ::0 foo
    ::1 foo
  `

  testHmr`
    # preserves value of locals that become props

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0 let a = 'foo'
      ::1 export let a = 'bar'
    </script>

    {a}

    * * * * *

    ::0 foo
    ::1 foo
  `

  testHmr`
    # preserves value of const that become local

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0 const a = 'foo'
      ::1 let a = 'bar'
    </script>

    {a}

    * * * * *

    ::0 foo
    ::1 foo
  `

  testHmr`
    # don't preserve value of exports that become const

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0 export let a = 'foo'
      ::1 const a = 'bar'
    </script>

    {a}

    * * * * *

    ::0 foo
    ::1 bar
  `

  describe('@!hmr', () => {
    testHmr`
      # sanity check: preserves local state

      --- App.svelte ---

      <!-- @hmr:keep-all -->

      <script>
        ::0 let a = 0; a = 1;
        ::1 let a = 0;
      </script>

      {a}

      * * * * *

      ::0 1
      ::1 1
    `

    testHmr`
      # force noPreserveState from markup

      --- App.svelte ---

      ::1 <!-- @!hmr -->

      <script>
        ::0 let a = 0; a = 1;
        ::1 let a = 0;
      </script>

      {a}

      * * * * *

      ::0 1
      ::1 0
    `

    testHmr`
      # force noPreserveState from script

      --- App.svelte ---

      <script>
        ::0 let a = 0; a = 1;
        ::1 let a = 0; // @!hmr
      </script>

      {a}

      * * * * *

      ::0 1
      ::1 0
    `

    testHmr`
      # only applies to the update that contains the flag

      --- App.svelte ---

      <!-- @hmr:keep-all -->

      <script>
        ::0 let a = 0; a = 1;
        ::1 '@!hmr'; let a = 2;
        ::2 let a = 4;
      </script>

      {a}

      * * * * *

      ::0 1
      ::1 2
      ::2 2
    `
  })

  testHmr`
    # does not crash when props are added to a component

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <Child />

    --- Child.svelte ---

    ::0::
    ::1::
    <script>
      export let x = 'x'
    </script>
    ::::

    ::0 I am Child
    ::1 I am Child.{x}

    * * * * *

    ::0 I am Child
    ::1 I am Child.x
  `

  testHmr`
    # does not crash when props are removed from a component

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <Child />

    --- Child.svelte ---

    ::0::
    <script>
      export let x = 'x'
    </script>
    ::1::
    ::::

    ::0 I am Child.{x}
    ::1 I am Child

    * * * * *

    ::0 I am Child.x
    ::1 I am Child
  `
})
