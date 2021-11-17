const { clickButton } = require('./helpers')

const describeIf =
  process.env.PRESERVE_LOCAL_STATE === 'smart' ? describe : describe.skip

describeIf('preserveLocalState: smart', () => {
  testHmr`
    # preserves 1 mutable

    --- App.svelte ---

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
    # preserves 2 mutables 

    --- App.svelte ---

    <script>
      let x = 0 
      let y = 10
      const increment = () => { x++, y++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y}
      ::1 after: {x};{y}
    </x-focus>

    * * * * *

    ::0::
      before: 0;10
      ${clickButton()}
      before: 1;11
    ::1::
      after: 1;11
  `

  testHmr`
    # resets if @hmr:reset

    --- App.svelte ---

    <script>
      let x = 0 
      let y = 10
      const increment = () => { x++, y++ }
      ::1 // @hmr:reset
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y}
      ::1 after: {x};{y}
    </x-focus>

    * * * * *

    ::0::
      before: 0;10
      ${clickButton()}
      before: 1;11
    ::1::
      after: 0;10
  `

  testHmr`
    # resets 1 mutable of several if init change

    --- App.svelte ---

    <script>
      ::0 let x = 0 
      ::1 let x = 100 
      let y = 10
      const increment = () => { x++, y++ }
      $: xy = x + y
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y}
      ::1 after: {x};{y}
      reactive sum = {xy}
      sum = {x + y}
    </x-focus>

    * * * * *

    ::0::
      before: 0;10
      reactive sum = 10
      sum = 10
      ${clickButton()}
      before: 1;11
      reactive sum = 12
      sum = 12
    ::1::
      after: 100;11
      reactive sum = 111
      sum = 111
  `

  testHmr`
    # preserves props

    --- App.svelte ---

    <script>
      export let x = 0 
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
    # reset props if init changes

    --- App.svelte ---

    <script>
      ::0 export let x = 0 
      ::1 export let x = 10 
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
      after: 10
  `

  testHmr`
    # reset propagates to child

    --- Child.svelte ---
    
    <script>
      export let foo = ''
    </script>
    
    {foo}
    
    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
      ::0 let x = 0 
      ::1 let x = 10 
      const increment = () => { x++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x} -- <Child foo="foo-{x}" />
      ::1 after: {x} -- <Child foo="foo-{x}" />
    </x-focus>

    * * * * *

    ::0::
      before: 0 -- foo-0
      ${clickButton()}
      before: 1 -- foo-1
    ::1::
      after: 10 -- foo-10
  `

  describe('normalization: ignore non significant spaces', () => {
    testHmr`
      # ignores non significant spaces before =

      --- App.svelte ---

      <script>
        ::0 let x = 0
        ::1 let  x  = 0 
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
      # ignores non significant spaces in primitive values

      --- App.svelte ---

      <script>
        ::0 let x = 0
        ::1 let  x  =  0 
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
      # ignores non significant spaces in single identifier

      --- App.svelte ---

      <script>
        const i = 0
      
        ::0 let x = i
        ::1 let  x  =  i  
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
      # ignores non significant spaces in binary expression

      --- App.svelte ---

      <script>
        const i = 0
      
        ::0 let x = i + i
        ::1 let  x  =  i  +  i 
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
      # ignores non significant spaces in multi members expression

      --- App.svelte ---

      <script>
        const i = 0
      
        ::0 let x = i + i + 0 + i
        ::1 let  x  =  i  +  i  +  0  +  i
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
  })
})
