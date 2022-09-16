<script>
  import ModuleContext, { y } from './ModuleContext.svelte'
</script>

<div>
  <p>
    I use <code>module:context</code> from my dep, so I get hit by changes
    happening in <code>ModuleContext.svelte</code>.
  </p>

  <ModuleContext>{y}</ModuleContext>
</div>
