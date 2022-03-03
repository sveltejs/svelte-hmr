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

  testHmr`
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

  testHmr`
    # instance function are preserved when binding to instance

    --- App.svelte ---

    <script>
      import {onMount} from 'svelte'
      import Foo from './Foo.svelte'

      let foo
      let x

      const update = () => {
        x = foo.get()
      }

      onMount(update)
    </script>

    <Foo bind:this={foo} />

    <x-focus>{x}</x-focus>

    <button on:click={update} />

    --- Foo.svelte ---

    <script>
      ::0 export const get = () => 1
      ::1 export const get = () => 2
    </script>

    * * * * *

    ::0::
      1
    ::1::
      ${clickButton()}
      2
  `

  testHmr`
    # const function bindings are preserved

    --- App.svelte ---

    <script>
      import {onMount} from 'svelte'
      import Foo from './Foo.svelte'

      let get
      let x

      const update = () => {
        x = get()
      }

      onMount(update)
    </script>

    <Foo bind:get />

    <x-focus>{x}</x-focus>

    <button on:click={update} />

    --- Foo.svelte ---

    <script>
      ::0 export const get = () => 1
      ::1 export const get = () => 2
    </script>

    * * * * *

    ::0::
      1
    ::1::
      ${clickButton()}
      2
  `

  testHmr`
    # const function bindings are preserved when variables change

    --- App.svelte ---

    <script>
      import {onMount} from 'svelte'
      import Foo from './Foo.svelte'

      let get
      let x

      const update = () => {
        x = get && get()
      }

      onMount(update)
    </script>

    <Foo bind:get />

    <x-focus>{x}</x-focus>

    <button on:click={update} />

    --- Foo.svelte ---

    <script>
      ::0 export const get = () => 1

      ::1 let foo = 'FOO'
      ::1 export let bar = 'BAR'
      ::1 export const get = () => 2
      ::1 $: console.log(foo + bar)

      ::2 let foo = 'FOO'
      ::2 $: console.log(foo)
      ::2 export const get = () => 3

      ::3 export const set = () => {}

      ::4 let foo = 'FOO'; let bar = 'BAR'; let baz = 'BAZ'; let bat = 'BAT';
      ::4 $: console.log(foo + bar + baz + bat)
      ::4 export const get = () => 4
    </script>

    * * * * *

    ::0::
      1
    ::1:: exported function order in variables changes
      1
      ${clickButton()}
      2
    ::2:: exported function order in variables changes again
      2
      ${clickButton()}
      3
    ::3:: exported function disappears
      3
      ${clickButton()}
      undefined
    ::4:: exported function comes back (at another index)
      undefined
      ${clickButton()}
      4
  `

  testHmr`
    # let function bindings are preserved

    --- App.svelte ---

    <script>
      import {onMount} from 'svelte'
      import Foo from './Foo.svelte'

      let get
      let x

      const update = () => {
        x = get()
      }

      onMount(update)
    </script>

    <Foo bind:get />

    <x-focus>{x}</x-focus>

    <button id="update" on:click={update} />

    --- Foo.svelte ---

    <script>
      ::0 export let get = () => 1
      ::1 export let get = () => 2

      export const change = () => {
        get = () => 3
      }
    </script>

    <button id="change-let" on:click={change} />

    * * * * *

    ::0::
      1
    ::1::
      ${clickButton('#update')}
      2
      ${clickButton('#change-let')}
      2
      ${clickButton('#update')}
      3
  `

  testHmr`
    # binding to a prop that does not exists yet

    --- App.svelte ---

    <script>
      import {onMount} from 'svelte'
      import Foo from './Foo.svelte'

      let get
      let x

      const update = () => {
        x = get && get()
      }

      onMount(update)
    </script>

    <Foo bind:get />

    <x-focus>{x}</x-focus>

    <button on:click={update} />

    --- Foo.svelte ---

    <script>
      ::0 export let bet = () => 1
      ::1 export let get = () => 2
    </script>

    * * * * *

    ::0::
      undefined
    ::1::
      ${clickButton()}
      2
  `
})
