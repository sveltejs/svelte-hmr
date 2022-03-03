const { clickButton, replaceInputValue } = require('./helpers')

describe('bindings', () => {
  testHmr`
    # preserves bound values when child changes

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
      let value
    </script>

    <Child bind:value />

    {value}

    --- Child.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      export let value = 0
      const onClick = () => value = value + 1
    </script>

    <button on:click={onClick}>+</button>

    ::0
    ::1 reloaded =>
    ::2 rere .

    * * * * * * * * * * * * * * * *

    <button>+</button>

    ::0:: load

      0
      ${clickButton()}
      1
      ${clickButton()}
      2

    ::1:: child changes

      reloaded => 2
      ${clickButton()}
      reloaded => 3

    ::2:: child changes again

      rere . 3
      ${clickButton()}
      rere . 4

  `

  // TODO should depend on preserveLocalState option
  testHmr.skip`
    # resets bound values when owner is updated

    --- App.svelte ---

    <script>
      let value = 123
    </script>

    ::0 <input bind:value />
    ::1 <input type="number" bind:value />

    <div>{value}</div>

    * * *

    ::0:: init

      <input />
      <div>123</div>
      ${replaceInputValue('456')}
      <input />
      <div>456</div>

    ::1:: change input type

      <input type="number" />
      <div>123</div>
  `
})
