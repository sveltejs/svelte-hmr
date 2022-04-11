<script context="module" lang="ts">
	import Foo from './Foo.svelte'

	export const KEY = {name:'ypa'};

	let valuex = "!"
</script>

<script>
	import { setContext } from 'svelte';

	setContext(KEY, {
		value: 1234
	});
</script>

<h1>Context Set :D</h1>

<slot />

<Foo suffix="xxxuy" bind:valuex>
	<p>{valuex}</p>
</Foo>
