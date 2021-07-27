describe('simultaneous update parent & child', () => {
  testHmr`
    # renders last version of everything

    --- a.js ---

    ::0 export default x => x
    ::1 export default x => x + '!'

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
      import wrap from './a'
    </script>

    <Child name={wrap('child')} />

    --- Child.svelte ---

    <script>
      import { fade } from 'svelte/transition'
      import wrap from './a'
      export let name
    </script>

    <div out:fade>
      <x-focus>
        {wrap('I am ' + name)}
      </x-focus>
    </div>

    * * *

    ::0::
      I am child
    ::1::
      I am child!!
  `
})
