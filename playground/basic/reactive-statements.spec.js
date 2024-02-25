import { describe, test, hmr, clickButton } from '$test'

describe('reactive statements', () => {
  test(
    'recomputes reactive blocks that depend on previously existing state',
    hmr([
      {
        files: {
          'App.svelte': ({ script }) => `
            <!-- @hmr:keep-all -->

            <script>
              ${
                script ??
                `
                  let a = 'foo'
                  $: rx = a + a
                `
              }
            </script>

            {a} {rx}
          `,
        },
        expect: 'foo foofoo',
      },
      {
        name: 'change',
        edit: {
          'App.svelte': {
            script: `
              let a = 'bar' // this one preserved = 'foo'
              $: rx = a + a
            `,
          },
        },
        expect: 'foo foofoo',
      },
    ])
  )

  test(
    'recomputes reactive blocks that depend on newly existing state',
    hmr([
      {
        files: {
          'App.svelte': ({ script, text }) => `
            <script>
              ${
                script ??
                `
                  let a = 'foo'
                  $: rx = a + a
                `
              }
            </script>

            ${text ?? '{a} {rx}'}
          `,
        },
        expect: 'foo foofoo',
      },
      {
        name: 'change',
        edit: {
          'App.svelte': {
            script: `
              let b = 'baz'
              $: rx = b + b
            `,
            text: '{b} {rx}',
          },
        },
        expect: 'baz bazbaz',
      },
    ])
  )

  test(
    'recomputes reactive blocks that depend on mixed newly & previously existing state',
    hmr([
      {
        files: {
          'App.svelte': ({ script, text }) => `
            <!-- @hmr:keep-all -->

            <script>
              ${
                script ??
                `
                  let a = 'foo'
                  $: rx = a + a
                `
              }
            </script>

            ${text ?? '{a} {rx}'}
          `,
        },
        expect: 'foo foofoo',
      },
      {
        name: 'change',
        edit: {
          'App.svelte': {
            script: `
              let a = 'bar' // preserved = 'foo'
              let b = 'baz'
              $: rx = a + b
            `,
            text: '{a} {b} {rx}',
          },
        },
        expect: 'foo baz foobaz',
      },
    ])
  )

  test(
    'side effects in reactive blocks',
    hmr([
      {
        files: {
          'App.svelte': ({ script }) => `
            <!-- @hmr:keep-all -->

            <script>
              ${
                script ??
                `
                  let a = 'foo'
                  let i = 0
                `
              }
              $: a, i = i + '.' + a
            </script>

            {a} {i}
          `,
        },
        expect: 'foo 0.foo',
      },
      {
        name: 'change',
        edit: {
          'App.svelte': {
            script: `
              let a = 'bar' // preserved = 'foo'
              let i = 5 // preserved = 0.foo
            `,
            text: '{a} -> {b} => {i}',
          },
        },
        expect: 'foo 0.foo.foo',
      },
    ])
  )

  test(
    'side effects in reactive blocks with multiple variables',
    hmr([
      {
        files: {
          'App.svelte': ({ script, text }) => `
            <!-- @hmr:keep-all -->

            <script>
              ${
                script ??
                `
                  let a = 'foo'
                  let i = 0
                  let rx
                  $: {
                    rx = a + a
                    i = i + '.' + rx
                  }
                `
              }
            </script>

            ${text ?? '{a} => {i}'}
          `,
        },
        expect: 'foo => 0.foofoo',
      },
      {
        name: 'change',
        edit: {
          'App.svelte': {
            script: `
              let a = 'bar' // preserved = 'foo'
              let b = 'baz'
              let i = 5 // preserved = '0.foofoo'
              let rx
              $: {
                rx = a + b
                i = i + '.' + rx
              }
            `,
            text: '{a} -> {b} => {i}',
          },
        },
        expect: 'foo -> baz => 0.foofoo.foobaz',
      },
    ])
  )

  test(
    'recomputes reactive blocks that depend on preserved state',
    hmr([
      {
        files: {
          'App.svelte': ({ script }) => `
            <!-- @hmr:keep-all -->

            <script>
              ${
                script ??
                `
                  let a = 'foo'
                  a = 'bar'
                  $: rx = a + a
                `
              }
            </script>

            {a} {rx}
          `,
        },
        expect: 'bar barbar',
      },
      {
        name: 'change',
        edit: {
          'App.svelte': {
            script: `
              let a = 'baz' // this one preserved = 'bar'
              $: rx = a + a
            `,
          },
        },
        expect: 'bar barbar',
      },
    ])
  )
})
