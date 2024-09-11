import { test, hmr, replace } from '$test'

test(
  'updates text content (twice)',
  hmr([
    {
      expect: '<h1>I am App</h1>',
    },
    {
      name: 'first change',
      edit: {
        'App.svelte': '<h1>I am Reloaded</h1>',
      },
      expect: '<h1>I am Reloaded</h1>',
    },
    {
      name: 'second change',
      edit: {
        'App.svelte': '<h2>I am Reloaded _again_</h2>',
      },
      expect: '<h2>I am Reloaded _again_</h2>',
    },
  ])
)

test(
  'updates child text when child changes',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import Child from './Child.svelte'
          </script>

          <Child name="foo" />
          <Child name="bar" />
          <Child name="baz" />
        `,
        'Child.svelte': ({ text }) => `
          <script>
            export let name
          </script>

          ${text ?? 'I am {name}.'}
        `,
      },
      expect: 'I am foo. I am bar. I am baz.',
    },
    {
      name: 'change',
      edit: {
        'Child.svelte': { text: 'My name is {name}.' },
      },
      expect: 'My name is foo. My name is bar. My name is baz.',
    },
  ])
)

test(
  'updates children elements',
  hmr([
    {
      files: {
        'App.svelte': `
          <p>First paragraph</p>
        `,
      },
      expect: '<p>First paragraph</p>',
    },
    {
      name: 'added',
      edit: {
        'App.svelte': `
          <p>First paragraph</p><p>Second paragraph</p>
        `,
      },
      expect: '<p>First paragraph</p><p>Second paragraph</p>',
    },
    {
      name: 'changed',
      edit: {
        'App.svelte': `
          <p>First paragraph</p>
          <p>Last paragraph</p>
        `,
      },
      expect: `
         <p>First paragraph</p>
         <p>Last paragraph</p>
      `,
    },
    {
      name: 'inserted',
      edit: {
        'App.svelte': `
          <p>First paragraph</p>
          <div>Middle</div>
          <p>Last paragraph</p>
        `,
      },
      expect: `
        <p>First paragraph</p>
        <div>Middle</div>
        <p>Last paragraph</p>
      `,
    },
  ])
)

test(
  'updates children elements',
  hmr([
    {
      files: {
        'App.svelte': '<p>First paragraph</p>',
      },
      expect: '<p>First paragraph</p>',
    },
    {
      name: 'added',
      edit: {
        'App.svelte': '<p>First paragraph</p><p>Second paragraph</p>',
      },
      expect: '<p>First paragraph</p><p>Second paragraph</p>',
    },
    {
      name: 'changed',
      edit: {
        'App.svelte': `
          <p>First paragraph</p>
          <p>Last paragraph</p>
        `,
      },
      expect: `
        <p>First paragraph</p>
        <p>Last paragraph</p>
      `,
    },
    {
      name: 'inserted',
      edit: {
        'App.svelte': `
          <p>First paragraph</p>
          <div>Middle</div>
          <p>Last paragraph</p>
        `,
      },
      expect: `
        <p>First paragraph</p>
        <div>Middle</div>
        <p>Last paragraph</p>
      `,
    },
  ])
)

test(
  'preserves children position when children change',
  hmr([
    {
      name: 'init',
      files: {
        'App.svelte': `
          <script>
            import Child from './Child.svelte'
          </script>
          <p>Pre</p>
          <Child name="foo" />
          <p>Mid</p>
          <Child name="bar" />
          <p>Post</p>
        `,
        'Child.svelte': `
          <script>
            export let name = 'Child'
          </script>

          <h2>I am {name}</h2>
        `,
      },
      expect: {
        body: `
          <p>Pre</p>
          <h2>I am foo</h2>
          <p>Mid</p>
          <h2>I am bar</h2>
          <p>Post</p>
        `,
      },
    },
    {
      name: 'child changed',
      edit: {
        'Child.svelte': replace(
          '<h2>I am {name}</h2>',
          '<h3>My name is {name}</h3>'
        ),
      },
      expect: {
        body: `
          <p>Pre</p>
          <h3>My name is foo</h3>
          <p>Mid</p>
          <h3>My name is bar</h3>
          <p>Post</p>
        `,
      },
    },
    {
      name: 'parent changed',
      edit: {
        'App.svelte': replace(
          /(?<=<\/script>)[\s\S]*$/m,
          `
            <p>avant</p>
            <Child name="foo" />
            <p>pendant</p>
            <Child name="bar" />
            <p>après</p>
          `
        ),
      },
      expect: {
        body: `
          <p>avant</p>
          <h3>My name is foo</h3>
          <p>pendant</p>
          <h3>My name is bar</h3>
          <p>après</p>
        `,
      },
    },
    {
      name: 'child changed again',
      edit: {
        'Child.svelte': replace(
          '<h3>My name is {name}</h3>',
          "<h3>Who's {name}?</h3>"
        ),
      },
      expect: {
        body: `
          <p>avant</p>
          <h3>Who's foo?</h3>
          <p>pendant</p>
          <h3>Who's bar?</h3>
          <p>après</p>
        `,
      },
    },
  ])
)
