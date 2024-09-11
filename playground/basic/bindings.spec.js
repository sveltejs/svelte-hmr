import { test, hmr, clickButton, replaceInputValue } from '$test'

test(
  'preserves bound values when child changes',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import Child from './Child.svelte'
            let value
          </script>

          <Child bind:value />

          {value}
        `,
        'Child.svelte': ({ text }) => `
          <!-- @hmr:keep-all -->

          <script>
            export let value = 0
            const onClick = () => value = value + 1
          </script>

          <button on:click={onClick}>+</button>

          ${text ?? ''}
        `,
      },
      steps: [
        { expect: '<button>+</button> 0' },
        clickButton(),
        { expect: '<button>+</button> 1' },
        clickButton(),
        { expect: '<button>+</button> 2' },
      ],
    },
    {
      name: 'child changes',
      edit: {
        'Child.svelte': { text: 'reloaded => ' },
      },
      steps: [
        { expect: '<button>+</button> reloaded => 2' },
        clickButton(),
        { expect: '<button>+</button> reloaded => 3' },
      ],
    },
    {
      name: 'child changes again',
      edit: {
        'Child.svelte': { text: 'rere .' },
      },
      steps: [
        { expect: '<button>+</button> rere . 3' },
        clickButton(),
        { expect: '<button>+</button> rere . 4' },
      ],
    },
  ])
)

test(
  'resets bound values when owner is updated',
  hmr([
    {
      files: {
        'App.svelte': ({ input }) => `
          <script>
            let value = 123
          </script>

          ${input ?? '<input bind:value />'}

          <div>{value}</div>
        `,
      },
      steps: [
        { expect: '<input /><div>123</div>' },
        replaceInputValue('456'),
        { expect: '<input /><div>456</div>' },
      ],
    },
    {
      name: 'change input type',
      edit: {
        'App.svelte': { input: '<input type="number" bind:value />' },
      },
      expect: '<input type="number" /><div>123</div>',
    },
  ])
)

test(
  'instance function are preserved when binding to instance',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import {onMount} from 'svelte'
            import Foo from './Foo.svelte'

            let foo
            let x

            const update = () => {
              x = foo.get()
            }

            onMount(update)
          </script>

          <Foo bind:this={foo} />

          <x-focus>{x}</x-focus>

          <button on:click={update} />
        `,
        'Foo.svelte': ({ script }) => `
          <script>
            ${script ?? 'export const get = () => 1'}
          </script>
        `,
      },
      expect: { 'x-focus': '1' },
    },
    {
      name: 'child changes',
      edit: {
        'Foo.svelte': { script: 'export const get = () => 2' },
      },
      steps: [
        clickButton(),
        { expect: { 'x-focus': '2' } },
        //
      ],
    },
  ])
)

test(
  'const function bindings are preserved',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import {onMount} from 'svelte'
            import Foo from './Foo.svelte'

            let get
            let x

            const update = () => {
              x = get()
            }

            onMount(update)
          </script>

          <Foo bind:get />

          <x-focus>{x}</x-focus>

          <button on:click={update} />
        `,
        'Foo.svelte': ({ script }) => `
          <script>
            ${script ?? 'export const get = () => 1'}
          </script>
        `,
      },
      expect: { 'x-focus': '1' },
    },
    {
      name: '',
      edit: {
        'Foo.svelte': { script: 'export const get = () => 2' },
      },
      steps: [
        //
        clickButton(),
        { expect: { 'x-focus': '2' } },
      ],
    },
  ])
)

test(
  'const function bindings are preserved when variables change',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import { onMount } from 'svelte'
            import Foo from './Foo.svelte'

            let get
            let x

            const update = () => {
              x = get && get()
            }

            onMount(update)
          </script>

          <Foo bind:get />

          <x-focus>{x}</x-focus>

          <button on:click={update} />
        `,
        'Foo.svelte': ({ script }) => `
          <script>
            ${script ?? 'export const get = () => 1'}
          </script>
        `,
      },
      expect: { 'x-focus': '1' },
    },
    {
      name: 'exported function order in variables changes',
      edit: {
        'Foo.svelte': {
          script: `
            let foo = 'FOO'
            export let bar = 'BAR'
            export const get = () => 2
            $: console.log(foo + bar)
          `,
        },
      },
      steps: [
        { expect: { 'x-focus': '1' } },
        clickButton(),
        { expect: { 'x-focus': '2' } },
      ],
    },
    {
      name: 'exported function order in variables changes again',
      edit: {
        'Foo.svelte': {
          script: `
            let foo = 'FOO'
            $: console.log(foo)
            export const get = () => 3
          `,
        },
      },
      steps: [
        { expect: { 'x-focus': '2' } },
        clickButton(),
        { expect: { 'x-focus': '3' } },
      ],
    },
    {
      name: 'exported function disappears',
      edit: {
        'Foo.svelte': {
          script: `
            export const set = () => {}
          `,
        },
      },
      steps: [
        { expect: { 'x-focus': '3' } },
        clickButton(),
        { expect: { 'x-focus': 'undefined' } },
      ],
    },
    {
      name: 'exported function comes back (at another index)',
      edit: {
        'Foo.svelte': {
          script: `
            let foo = 'FOO'; let bar = 'BAR'; let baz = 'BAZ'; let bat = 'BAT';
            $: console.log(foo + bar + baz + bat)
            export const get = () => 4
          `,
        },
      },
      steps: [
        { expect: { 'x-focus': 'undefined' } },
        clickButton(),
        { expect: { 'x-focus': '4' } },
      ],
    },
  ])
)

test(
  'let function bindings are preserved',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import {onMount} from 'svelte'
            import Foo from './Foo.svelte'

            let get
            let x

            const update = () => {
              x = get()
            }

            onMount(update)
          </script>

          <Foo bind:get />

          <x-focus>{x}</x-focus>

          <button id="update" on:click={update} />
        `,
        'Foo.svelte': ({ prop }) => `
          <script>
            ${prop ?? 'export let get = () => 1'}

            export const change = () => {
              get = () => 3
            }
          </script>

          <button id="change-let" on:click={change} />
        `,
      },
      expect: { 'x-focus': '1' },
    },
    {
      name: 'prop changes',
      edit: {
        'Foo.svelte': { prop: 'export let get = () => 2' },
      },
      steps: [
        clickButton('#update'),
        { expect: { 'x-focus': '2' } },
        clickButton('#change-let'),
        { expect: { 'x-focus': '2' } },
        clickButton('#update'),
        { expect: { 'x-focus': '3' } },
      ],
    },
  ])
)

test(
  'binding to a prop that does not exists yet',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import {onMount} from 'svelte'
            import Foo from './Foo.svelte'

            let get
            let x

            const update = () => {
              x = get && get()
            }

            onMount(update)
          </script>

          <Foo bind:get />

          <x-focus>{x}</x-focus>

          <button on:click={update} />
        `,
        'Foo.svelte': ({ script }) => `
          <script>
            ${script ?? 'export let bet = () => 1'}
          </script>
        `,
      },
      expect: { 'x-focus': 'undefined' },
    },
    {
      name: 'prop changes',
      edit: {
        'Foo.svelte': { script: 'export let get = () => 2' },
      },
      steps: [
        { expect: { 'x-focus': 'undefined' } },
        clickButton(),
        { expect: { 'x-focus': '2' } },
      ],
    },
    {
      name: "doesn't reuse a wrong variable in the right place",
      edit: {
        'Foo.svelte': { script: 'export let bet = () => 3' },
      },
      steps: [
        { expect: { 'x-focus': '2' } },
        clickButton(),
        { expect: { 'x-focus': 'undefined' } },
      ],
    },
    {
      name: 'remembers older future prop',
      edit: {
        'Foo.svelte': { script: 'export let get = () => 4' },
      },
      steps: [
        { expect: { 'x-focus': 'undefined' } },
        clickButton(),
        { expect: { 'x-focus': '4' } },
      ],
    },
  ])
)
