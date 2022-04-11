<script>
	let isOpen = 10;
  export const open = () => {
		// After a hot reload, this will not modify
		// the correct isOpen variable anymore.
		isOpen++
	}
</script>

Open: {isOpen} &lt;
