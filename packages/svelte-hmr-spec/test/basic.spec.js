const { init, templates, change, innerText } = require('test-hmr')

describe('basic', () => {
  testHmr('updates text content (twice)', function*() {
    yield init({
      'App.svelte': '<h1>HMRd</h1>',
    })
    expect(yield innerText('h1'), 'update 1').to.equal('HMRd')

    yield change({
      'App.svelte': '<h1>reHMRd</h1>',
    })
    expect(yield innerText('h1'), 'update 2').to.equal('reHMRd')
  })

  testHmr('updates child text when child changes', function*() {
    yield templates({
      'App.svelte': slot => `
        <script>
          import Child from './Child.svelte'
        </script>
        ${slot}
      `,
    })

    yield init({
      'App.svelte': '<Child />',
      'Child.svelte': '<h2>I am Child</h2>',
    })
    expect(yield innerText('h2')).to.equal('I am Child')

    yield change({
      'Child.svelte': '<h2>I am Kid</h2>',
    })
    expect(yield innerText('h2')).to.equal('I am Kid')
  })

  testHmr`
    # updates text content

    ---- App.svelte ----

    ::0 <h1>I am App</h1>
    ::1 <h1>I am Reloaded</h1>

    *****

    ::0 <h1>I am App</h1>
    ::1 <h1>I am Reloaded</h1>
  `

  // 2019-07-18 this was broken in svelte-dev-helper
  testHmr`
    # rerenders all instances of same child

    --- App.svelte ---

    <script>
      import Child from './Child.svelte'
    </script>

    <Child name="foo" />
    <Child name="bar" />
    <Child name="baz" />

    --- Child.svelte ---

    <script>
      export let name
    </script>

    ::0 I am {name}.
    ::1 My name is {name}.

    * * *

    ::0 I am foo. I am bar. I am baz.
    ::1 My name is foo. My name is bar. My name is baz.
  `

  testHmr`
    # updates children elements

    ---- App.svelte ----

    ::0::
      <p>First paragraph</p>
    ::1:: added
      <p>First paragraph</p>
      <p>Second paragraph</p>
    ::2:: changed
      <p>First paragraph</p>
      <p>Last paragraph</p>
    ::3:: inserted
      <p>First paragraph</p>
      <div>Middle</div>
      <p>Last paragraph</p>

    ****

    ::0::
      <p>First paragraph</p>
    ::1::
      <p>First paragraph</p>
      <p>Second paragraph</p>
    ::2::
      <p>First paragraph</p>
      <p>Last paragraph</p>
    ::3::
      <p>First paragraph</p>
      <div>Middle</div>
      <p>Last paragraph</p>
  `

  testHmr`
    # preserves children position when children change

    ---- App.svelte ----

    <script>
      import Child from './Child.svelte'
    </script>

    ::0::

      <p>Pre</p>
      <Child name="foo" />
      <p>Mid</p>
      <Child name="bar" />
      <p>Post</p>

    ::2::

      <p>avant</p>
      <Child name="foo" />
      <p>pendant</p>
      <Child name="bar" />
      <p>après</p>

    ---- Child.svelte ----

    <script>
      export let name = 'Child'
    </script>

    ::0 <h2>I am {name}</h2>

    ::1 <h3>My name is {name}</h3>

    ::3 <h3>Who's {name}?</h3>

    * * * *

    ::0:: init

      <p>Pre</p>
      <h2>I am foo</h2>
      <p>Mid</p>
      <h2>I am bar</h2>
      <p>Post</p>

    ::1:: child changed

      <p>Pre</p>
      <h3>My name is foo</h3>
      <p>Mid</p>
      <h3>My name is bar</h3>
      <p>Post</p>

    ::2:: parent changed

      <p>avant</p>
      <h3>My name is foo</h3>
      <p>pendant</p>
      <h3>My name is bar</h3>
      <p>après</p>

    ::3:: child changed again

      <p>avant</p>
      <h3>Who's foo?</h3>
      <p>pendant</p>
      <h3>Who's bar?</h3>
      <p>après</p>
  `
})
