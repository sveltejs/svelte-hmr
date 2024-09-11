import { test, hmr } from '$test'

test(
  'does not crash when reloading an empty component',
  hmr([
    {
      files: {
        'App.svelte': '',
      },
      expect: '',
    },
    {
      name: 'changes',
      edit: {
        'App.svelte': 'foo',
      },
      expect: 'foo',
    },
    {
      name: 'clears',
      edit: {
        'App.svelte': '',
      },
      expect: '',
    },
  ])
)
