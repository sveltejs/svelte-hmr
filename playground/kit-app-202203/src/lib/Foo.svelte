<script context="module">
  export const foo = 'yes'
</script>

<script>
  export let suffix = ""
  export let valuex = "poo"
</script>

<div>
  <h3>I'm Foo{suffix}!!!!!</h3>
  <pre>
    <slot />
  </pre>
  ({valuex})
</div>
