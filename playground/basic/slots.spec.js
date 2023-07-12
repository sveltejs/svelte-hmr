import { describe, test, hmr } from '$test'

describe('slots', () => {
  test(
    'updates default slot when parent changes',
    hmr([
      {
        files: {
          'App.svelte': ({ markup }) => `
            <script>
              import Child from './Child.svelte'
            </script>

            ${markup ?? '<Child />'}
          `,
          'Child.svelte': `
            <h2>
              <slot>I am Child</slot>
            </h2>
          `,
        },
        expect: '<h2>I am Child</h2>',
      },
      {
        name: 'app changes',
        edit: {
          'App.svelte': { markup: '<Child>I am Slot</Child>' },
        },
        expect: '<h2>I am Slot</h2>',
      },
    ])
  )

  test(
    'updates default slot when child changes',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <Child>I am Slot</Child>
          `,
          'Child.svelte': ({ title }) => `
            <h2>
              ${title ?? '<slot>I am Child</slot>'}
            </h2>
          `,
        },
        expect: '<h2>I am Slot</h2>',
      },
      {
        name: 'app changes',
        edit: {
          'Child.svelte': { title: 'I am Child' },
        },
        expect: '<h2>I am Child</h2>',
      },
    ])
  )

  test(
    'updates named slot when child changes',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <Child>
              <span slot="dd">Ola</span>
            </Child>
          `,
          'Child.svelte': ({ div, p, h1 }) => `
            <div>
              ${div ?? '<slot name="dd" />'}
            </div>

            <p>
              ${p ?? '<slot name="pp">Pa pa pa</slot>'}
            </p>

            ${h1 ?? ''}
          `,
        },
        expect: `
          <div>
            <span slot="dd">Ola</span>
          </div>
          <p>Pa pa pa</p>
        `,
      },
      {
        name: 'move to another element',
        edit: {
          'Child.svelte': {
            div: '<slot name="pp" />',
            p: '<slot name="dd">Pa pa pa</slot>',
          },
        },
        expect: `
          <div></div>
          <p>
            <span slot="dd">Ola</span>
          </p>
        `,
      },
      {
        name: 'move to a new element',
        edit: {
          'Child.svelte': {
            div: '<slot name="pp" />',
            p: '<slot name="xx">Pa pa pa</slot>',
            h1: '<h1><slot name="dd" /></h1>',
          },
        },
        expect: `
          <div></div>
          <p>Pa pa pa</p>
          <h1>
            <span slot="dd">Ola</span>
          </h1>
        `,
      },
    ])
  )

  test(
    'updates new slots',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <Child>
              <div slot="a">alpha</div>
              <div slot="b">beta</div>
            </Child>
          `,
          'Child.svelte': ({ code }) => code ?? '<slot name="a">a</slot>',
        },
        expect: '<div slot="a">alpha</div>',
      },
      {
        name: 'first change',
        edit: {
          'Child.svelte': {
            code: `
              <slot name="b">b</slot>
            `,
          },
        },
        expect: '<div slot="b">beta</div>',
      },
      {
        name: 'second change',
        edit: {
          'Child.svelte': {
            code: `
              <slot name="a">alpha</slot>
              <slot name="b">beta</slot>
            `,
          },
        },
        expect: `
          <div slot="a">alpha</div>
          <div slot="b">beta</div>
        `,
      },
    ])
  )
})
