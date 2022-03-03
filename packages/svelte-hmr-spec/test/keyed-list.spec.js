const { clickButton } = require('./helpers')

describe('keyed lists', () => {
  testHmr`
    # preserves position of reordered child items when child updates

    ---- App.svelte ----

    <script>
      import Child from './Child.svelte'
      let items = [
        {id: 1, text: 'foo'},
        {id: 2, text: 'bar'},
      ]
      const reverseItems = () => {
        items = items.reverse()
      }
    </script>

    <button on:click={reverseItems} />

    <x-focus>
      {#each items as item (item.id)}
        <Child text={item.text} />
      {/each}
    </x-focus>

    ---- Child.svelte ----

    <script>
      export let text
    </script>

    ::0 -{text}-
    ::1 ={text}=

    *****

    ::0::
      -foo--bar-
      ${clickButton()}
      -bar--foo-
    ::1::
      =bar==foo=
  `
})
