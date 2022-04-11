<script context="module">
  export const whatever = true
</script>

<script lang="ts">
  import { onMount } from 'svelte'

	import GetContext from '$lib/GetContext.svelte';
	import SetContext from '$lib/SetContext.svelte';

  let counter = 0

  onMount(() => {
    const interval = setInterval(() => {
      counter ++
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  })
</script>

<h1>Index</h1>

<!-- <pre>{JSON.stringify(whatever, false, 2)}</pre> -->

<!-- <pre>{JSON.stringify(KEY, null, 2)}</pre> -->

<p>{counter}</p>

<SetContext>
	<GetContext />
</SetContext>
