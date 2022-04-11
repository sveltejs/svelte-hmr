<script context="module" lang="ts">
	export const KEY = {};
  export let writy = 'foo'
</script>

<script>
	import { setContext } from 'svelte';

	setContext(KEY, {
		value: 12345
	});
</script>

<h1>Context Set :D</h1>

<slot />
