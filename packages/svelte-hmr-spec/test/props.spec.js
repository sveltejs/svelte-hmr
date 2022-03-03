const { testHmr } = require('test-hmr')
const { clickButton } = require('./helpers')

describe('props', () => {
  testHmr`
    # preserves props value

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'

      let name = 'foo'

      // NOTE ensure _changed_ (i.e. current) props are preserved too, not just
      // initial props -- bug detected on 2021-01-25
      const changeName = () => {
        name = 'foofoo'
      }
    </script>

    <x-focus>
      <Child {name} />
      <Child name="bar" />
    </x-focus>

    <button on:click={changeName} />

    --- Child.svelte ---

    <script>
      export let name = 'Child'
    </script>

    ::0 I am {name}
    ::1 My name is {name}

    * * *

    ::0::
      I am foo
      I am bar
      ${clickButton()}
      I am foofoo
      I am bar
    ::1::
      My name is foofoo
      My name is bar
  `

  testHmr`
    # preserves value of uninitialized props

    ${function*() {
      yield this.cons.ignoreWarnings(
        "<Child> was created without expected prop 'name'"
      )
    }}

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'

      let name

      // NOTE ensure _changed_ (i.e. current) props are preserved too, not just
      // initial props -- bug detected on 2021-01-25
      const changeName = () => {
        name = 'foo'
      }
    </script>

    <x-focus>
      ::0 <Child />
      ::1 <Child {name} />
    </x-focus>

    <button on:click={changeName} />

    --- Child.svelte ---

    <script>
      export let name
    </script>

    ::0 I am {name}
    ::2 My name is {name}

    * * *

    ::0::
      I am undefined
    ::1::
      I am undefined
      ${clickButton()}
      I am foo
    ::2::
      My name is foo
  `

  testHmr`
    # preserves props value with preserveLocalState

    --- App.svelte ---

    <script>
      // @hmr:keep-all
      import Child from './Child.svelte'

      let name = 'foo'

      // NOTE ensure _changed_ (i.e. current) props are preserved too, not just
      // initial props -- bug detected on 2021-01-25
      const changeName = () => {
        name = 'foofoo'
      }
    </script>

    <x-focus>
      <Child {name} />
      <Child name="bar" />
    </x-focus>

    <button on:click={changeName} />

    --- Child.svelte ---

    <script>
      // @hmr:keep-all
      export let name = 'Child'
    </script>

    ::0 I am {name}
    ::1 My name is {name}

    * * *

    ::0::
      I am foo
      I am bar
      ${clickButton()}
      I am foofoo
      I am bar
    ::1::
      My name is foofoo
      My name is bar
  `

  testHmr`
    # doesn't trigger a warning when props are removed between updates

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <Child name="foo" />

    --- Child.svelte ---

    <script>
      export let name
      ::0 export let surname = 'bar'
      ::1 // export let surname = 'bar'
    </script>

    ::0 I am {name} "{surname}"
    ::1 I am {name}

    * * *

    ::0 I am foo "bar"
    ::1 I am foo
  `

  testHmr`
    # restores value of aliased props (export {... as ...})

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
      let firstName = 'foo'
      const click = () => {
        firstName += firstName
      }
    </script>

    <button on:click={click} />
    <Child {firstName} />

    --- Child.svelte ---

    <!-- @hmr:keep-all -->

    <script>
      ::0::
        let name
        let surname = 'bar'
        export { name as firstName, surname as lastName }
      ::1::
        let name
        export { name as firstName }
      ::::
    </script>

    <x-focus>
      ::0 I am {name} "{surname}"
      ::1 I am {name}
    </x-focus>

    * * * * *

    ::0::
       I am foo "bar"
       ${clickButton()}
       I am foofoo "bar"
    ::1::
       I am foofoo
  `
})
