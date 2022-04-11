<script lang="ts">
	import GetContext from '$lib/GetContext.svelte';
	import SetContext from '$lib/SetContext.svelte';
</script>

<h1>Indexy</h1>

<SetContext>
	<GetContext />
</SetContext>
