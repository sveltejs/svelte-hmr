import { test, describe } from 'zorax'
import { compile, walk, parse } from 'svelte/compiler'

import { createMakeHot } from '../index.js'
import { injectScopeEverythingCssRule, normalizeNonJs } from './css-only.js'

describe('normalizeNonJs', () => {
  const shouldNeverChange = ({ emitCss = true } = {}) => (t, updates) => {
    const makeHot = createMakeHot({ walk })

    const compileToJs = code => {
      const id = 'Main.svelte'

      const compileOptions = {
        css: !emitCss,
        cssHash: () => 'main_12-34',
      }

      code = injectScopeEverythingCssRule(parse, code)

      const compiled = compile(code, compileOptions)

      if (emitCss && compiled.css.code) {
        // TODO properly update sourcemap?
        compiled.js.code += `\nimport ${id}.css;\n`
      }

      compiled.js.code = makeHot({
        id,
        compiledCode: compiled.js.code,
        hotOptions: {},
        compiled,
        originalCode: code,
        compileOptions,
      })

      return compiled.js.code
    }

    let code = updates.shift()
    let normal = normalizeNonJs(compileToJs(code))

    for (const step of updates) {
      const next = typeof step === 'function' ? step(code) : step
      const normalNext = normalizeNonJs(compileToJs(next))
      t.eq(normalNext, normal)
      code = next
      normal = normalNext
    }
  }

  test('no CSS', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
    `,
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
    `,
  ])

  test('empty CSS', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <style></style>
      <h1>Title</h1>
      <Foo />
    `,
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <style></style>
      <h1>Title</h1>
      <Foo />
    `,
  ])

  test('basic css change', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
      <style>
        h1 {
          color: red;
        }
      </style>
    `,
    x => x.replace('red', 'blue'),
  ])

  test('style first', shouldNeverChange(), [
    `
      <style>
        h1 {
          color: red;
        }
      </style>
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
    `,
    x => x.replace('red', 'blue'),
  ])

  test('style middle', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <style>
        h1 {
          color: red;
        }
      </style>
      <h1>Title</h1>
      <Foo />
    `,
    x => x.replace('red', 'blue'),
  ])

  test('style moving', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <style>
        h1 {
          color: red;
        }
      </style>
      <h1>Title</h1>
      <Foo />
    `,
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
      <style>
        h1 {
          color: red;
        }
      </style>
    `,
  ])

  test('add whitespaces', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
      <style>
        h1 {
          color: red;
        }
      </style>
    `,
    `
      <script>

        import Foo from './Foo.svelte'

      </script>

      <h1>Title</h1>

      <Foo />

      <style>

        h1 {

          color: red;

        }

      </style>
    `,
  ])

  test('new selector', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <p>Para</p>
      <style>
        h1 { color: red; }
      </style>
    `,
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <p>Para</p>
      <style>
        h1 { color: blue; }
        p { color: green; }
      </style>
    `,
  ])

  test('remove selector', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <p>Para</p>
      <style>
        h1 { color: blue; }
        p { color: green; }
      </style>
    `,
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <p>Para</p>
      <style>
        h1 { color: red; }
      </style>
    `,
  ])

  test('add :global', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
      <style>
        h1 { color: red; }
      </style>
    `,
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
      <style>
        h1 { color: red; }
        :global(h1) { font-weight: bold; }
      </style>
    `,
  ])

  test('remove :global', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
      <style>
        h1 { color: red; }
        :global(h1) { font-weight: bold; }
      </style>
    `,
    `
      <script>
        import Foo from './Foo.svelte'
      </script>
      <h1>Title</h1>
      <Foo />
      <style>
        h1 { color: red; }
      </style>
    `,
  ])

  test('nested elements', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
        let x = 0
      </script>
      <h1>Title</h1>
      <div>
        <p>p1</p>
        <p>p2 <span>but <strong>strr{x}</strong>!!</span>!</p>
      </div>
      <Foo />
      <style>
        h1 { color: red; }
        p span { font-weight: bold; }
        strong { color: purple }
      </style>
    `,
    `
      <script>
        import Foo from './Foo.svelte'
        let x = 0
      </script>
      <h1>Title</h1>
      <div>
        <p>p1</p>
        <p>p2 <span>but <strong>strr{x}</strong>!!</span>!</p>
      </div>
      <Foo />
      <style>
        h1 { color: red; }
        :global(h1) { font-weight: bold; }
        p span { font-weight: bold; }
      </style>
    `,
  ])

  test('{#if}', shouldNeverChange(), [
    `
      <script>
        import Foo from './Foo.svelte'
        let x = 0
      </script>
      <h1>Title</h1>
      <div on:click={() => x++}>
        <p>p1</p>
        {#if x > 0}
          <p>p2 <span>but <strong>strr{x}</strong>!!</span>!</p>
        {/if}
      </div>
      <Foo />
      <style>
        h1 { color: red; }
        p span { font-weight: bold; }
        strong { color: purple }
      </style>
    `,
    `
      <script>
        import Foo from './Foo.svelte'
        let x = 0
      </script>
      <h1>Title</h1>
      <div on:click={() => x++}>
        <p>p1</p>
        {#if x > 0}
          <p>p2 <span>but <strong>strr{x}</strong>!!</span>!</p>
        {/if}
      </div>
      <Foo />
      <style>
        h1 { color: red; }
        :global(h1) { font-weight: bold; }
        p span { font-weight: bold; }
        strong {}
      </style>
    `,
  ])

  test('dynamic classes', shouldNeverChange(), [
    `
      <script>
        let x = 0
        $: active = x > 0
      </script>
      <p class:active>Para</p>
      <style>
        p { color: red; }
        .active { font-weight: bold }
      </style>
    `,
    `
      <script>
        let x = 0
        $: active = x > 0
      </script>
      <p class:active>Para</p>
      <style>
        p { color: blue; }
        .active { font-weight: bold }
      </style>
    `,
  ])
})
