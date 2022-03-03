describe('reactive statements', () => {
  testHmr`
    # recomputes reactive blocks that depend on previously existing state

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0::
        let a = 'foo'
        $: rx = a + a
      ::1::
        let a = 'bar' // this one preserved = 'foo'
        $: rx = a + a
      :::::
    </script>

    {a} {rx}

    * * * * *

    ::0 foo foofoo
    ::1 foo foofoo
  `

  testHmr`
    # recomputes reactive blocks that depend on newly existing state

    --- App.svelte ---

    <script>
      ::0::
        let a = 'foo'
        $: rx = a + a
      ::1::
        let b = 'baz'
        $: rx = b + b
      :::::
    </script>

    ::0 {a} {rx}
    ::1 {b} {rx}

    * * * * *

    ::0 foo foofoo
    ::1 baz bazbaz
  `

  testHmr`
    # recomputes reactive blocks that depend on mixed newly & previously existing state

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0::
        let a = 'foo'
        $: rx = a + a
      ::1::
        let a = 'bar' // preserved = 'foo'
        let b = 'baz'
        $: rx = a + b
      :::::
    </script>

    ::0 {a} {rx}
    ::1 {a} {b} {rx}

    * * * * *

    ::0 foo foofoo
    ::1 foo baz foobaz
  `

  testHmr`
    # side effects in reactive blocks

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0::
        let a = 'foo'
        let i = 0
      ::1::
        let a = 'bar' // preserved = 'foo'
        let i = 5 // preserved = 0.foo
      :::::
      $: a, i = i + '.' + a
    </script>

    {a} {i}

    * * * * *

    ::0 foo 0.foo
    ::1 foo 0.foo.foo
  `

  testHmr`
    # side effects in reactive blocks with multiple variables

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0::
        let a = 'foo'
        let i = 0
        let rx
        $: {
          rx = a + a
          i = i + '.' + rx
        }
      ::1::
        let a = 'bar' // preserved = 'foo'
        let b = 'baz'
        let i = 5 // preserved = '0.foofoo'
        let rx
        $: {
          rx = a + b
          i = i + '.' + rx
        }
      :::::
    </script>

    ::0 {a} => {i}
    ::1 {a} -> {b} => {i}

    * * * * *

    ::0 foo => 0.foofoo
    ::1 foo -> baz => 0.foofoo.foobaz
  `

  testHmr`
    # recomputes reactive blocks that depend on preserved state

    --- App.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0::
        let a = 'foo'
        a = 'bar'
        $: rx = a + a
      ::1::
        let a = 'baz' // this one preserved = 'bar'
        $: rx = a + a
      :::::
    </script>

    {a} {rx}

    * * * * *

    ::0 bar barbar
    ::1 bar barbar
  `
})
