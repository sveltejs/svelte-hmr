<script>
	import { getContext } from 'svelte';
	import { KEY } from './SetContext.svelte';
	// import { KEY } from './SetContext.module.js';

	// const { value } = getContext(KEY)
	const ctx = getContext(KEY);
</script>

<h1>Context Get(ted)</h1>
<!-- <h2>Value: {value}</h2> -->
<h2>Value: {ctx.value}</h2>

<h3>Key: {JSON.stringify(KEY, false, 2)}</h3>
