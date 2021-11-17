<script>
	let x = 0;

	const increment = () => {
		x++;
	};

</script>

<p>{x}</p>

<button on:click={increment}>++</button>
