describe('stores', () => {
  /**
   * $inject_state will try to `.set` the store if it is passed the subscribed
   * variable (e.g. `$x`). If the store is not writable, it will crash. If it
   * is writable... I'm not too sure but it doesn't necessarily seems good.
   */
  testHmr`
    # does not crashes with non writtable stores subscriptions

    --- App.svelte ---

    <script>
      import { readable } from 'svelte/store'

      // it has to be a let (not a const!) for Svelte to instrument it
      let x = readable(42)

    </script>

    ::0 {$x}
    ::1 >> {$x}

    * * * * *

    ::0 42
    ::1 >> 42
  `
})
