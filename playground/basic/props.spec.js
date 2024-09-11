import { describe, test, hmr, clickButton } from '$test'

describe('props', () => {
  test(
    'preserves props value',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'

              let name = 'foo'

              // NOTE ensure _changed_ (i.e. current) props are preserved too, not just
              // initial props -- bug detected on 2021-01-25
              const changeName = () => {
                name = 'foofoo'
              }
            </script>

            <x-focus>
              <Child {name} />
              <Child name="bar" />
            </x-focus>

            <button on:click={changeName} />
          `,
          'Child.svelte': ({ text }) => `
            <script>
              export let name = 'Child'
            </script>

            ${text ?? 'I am {name}'}
          `,
        },
        steps: [
          { expect: { 'x-focus': 'I am foo I am bar' } },
          clickButton(),
          { expect: { 'x-focus': 'I am foofoo I am bar' } },
        ],
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            text: 'My name is {name}',
          },
        },
        expect: { 'x-focus': 'My name is foofoo My name is bar' },
      },
    ])
  )

  test(
    'preserves value of uninitialized props',
    hmr([
      {
        files: {
          'App.svelte': ({ markup }) => `
            <script>
              import Child from './Child.svelte'

              let name

              // NOTE ensure _changed_ (i.e. current) props are preserved too, not just
              // initial props -- bug detected on 2021-01-25
              const changeName = () => {
                name = 'foo'
              }
            </script>

            <x-focus>
              ${markup ?? '<Child />'}
            </x-focus>

            <button on:click={changeName} />
          `,
          'Child.svelte': ({ text }) => `
            <script>
              export let name
            </script>

            ${text ?? 'I am {name}'}
          `,
        },
        expect: { 'x-focus': 'I am undefined' },
      },
      {
        name: 'component changes',
        edit: {
          'App.svelte': {
            markup: '<Child {name} />',
          },
        },
        steps: [
          { expect: { 'x-focus': 'I am undefined' } },
          clickButton(),
          { expect: { 'x-focus': 'I am foo' } },
        ],
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            text: 'My name is {name}',
          },
        },
        expect: { 'x-focus': 'My name is foo' },
      },
    ])
  )

  test(
    'preserves props value with preserveLocalState',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              // @hmr:keep-all
              import Child from './Child.svelte'

              let name = 'foo'

              // NOTE ensure _changed_ (i.e. current) props are preserved too,
              // not just initial props -- bug detected on 2021-01-25
              const changeName = () => {
                name = 'foofoo'
              }
            </script>

            <x-focus>
              <Child {name} />
              <Child name="bar" />
            </x-focus>

            <button on:click={changeName} />
          `,
          'Child.svelte': ({ text }) => `
            <script>
              // @hmr:keep-all
              export let name = 'Child'
            </script>

            ${text ?? 'I am {name}'}
          `,
        },
        steps: [
          { expect: { 'x-focus': 'I am foo I am bar' } },
          clickButton(),
          { expect: { 'x-focus': 'I am foofoo I am bar' } },
        ],
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            text: 'My name is {name}',
          },
        },
        expect: { 'x-focus': 'My name is foofoo My name is bar' },
      },
    ])
  )

  test(
    "doesn't trigger a warning when props are removed between updates",
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
            </script>

            <Child name="foo" />
          `,
          'Child.svelte': ({ prop, text }) => `
            <script>
              export let name
              ${prop ?? "export let surname = 'bar'"}
            </script>

            ${text ?? 'I am {name} "{surname}"'}
          `,
        },
        expect: 'I am foo "bar"',
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            prop: "// export let surname = 'bar'",
            text: 'I am {name}',
          },
        },
        expect: 'I am foo',
      },
    ])
  )

  test(
    'restores value of aliased props (export {... as ...})',
    hmr([
      {
        files: {
          'App.svelte': `
            <script>
              import Child from './Child.svelte'
              let firstName = 'foo'
              const click = () => {
                firstName += firstName
              }
            </script>

            <button on:click={click} />
            <Child {firstName} />
          `,
          'Child.svelte': ({ script, text }) => `
            <!-- @hmr:keep-all -->

            <script>
              ${
                script ??
                `
                  let name
                  let surname = 'bar'
                  export { name as firstName, surname as lastName }
                `
              }
            </script>

            <x-focus>
              ${text ?? 'I am {name} "{surname}"'}
            </x-focus>
          `,
        },
        steps: [
          { expect: { 'x-focus': 'I am foo "bar"' } },
          clickButton(),
          { expect: { 'x-focus': 'I am foofoo "bar"' } },
        ],
      },
      {
        name: 'child changes',
        edit: {
          'Child.svelte': {
            script: `
              let name
              export { name as firstName }
            `,
            text: 'I am {name}',
          },
        },
        expect: { 'x-focus': 'I am foofoo' },
      },
    ])
  )
})
