<script>
	import Inner from "./Inner.svelte";

	let open;
</script>

<Inner bind:open />

<button on:click={open}>Open</button>
