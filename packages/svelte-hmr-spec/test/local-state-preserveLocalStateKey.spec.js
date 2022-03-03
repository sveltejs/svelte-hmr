const { clickButton } = require('./helpers')

describe('local state: preserveLocalStateKey', () => {
  testHmr`
    # inline annotation

    --- App.svelte ---

    <script>
      let x = 0 // @hmr:keep
      let y = 0
      const increment = () => { x++, y++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y}
      ::1 after: {x};{y}
    </x-focus>

    * * * * *

    ::0::
      before: 0;0
      ${clickButton()}
      before: 1;1
    ::1::
      after: 1;0
  `

  testHmr`
    # above anotation

    --- App.svelte ---

    <script>
      // @hmr:keep
      let x = 0
      let y = 0
      const increment = () => { x++, y++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y}
      ::1 after: {x};{y}
    </x-focus>

    * * * * *

    ::0::
      before: 0;0
      ${clickButton()}
      before: 1;1
    ::1::
      after: 1;0
  `

  testHmr`
    # inline annotation of multiple declaration

    --- App.svelte ---

    <script>
      let x = 0, z = 20 // @hmr:keep
      let y = 10
      const increment = () => { x++, y++, z++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y};{z}
      ::1 after: {x};{y};{z}
    </x-focus>

    * * * * *

    ::0::
      before: 0;10;20
      ${clickButton()}
      before: 1;11;21
    ::1::
      after: 1;10;21
  `

  testHmr`
    # above annotation of multiple declaration

    --- App.svelte ---

    <script>
      // @hmr:keep
      let x = 0,
          z = 20
      let y = 10
      const increment = () => { x++, y++, z++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y};{z}
      ::1 after: {x};{y};{z}
    </x-focus>

    * * * * *

    ::0::
      before: 0;10;20
      ${clickButton()}
      before: 1;11;21
    ::1::
      after: 1;10;21
  `

  describe('assignment', () => {
    testHmr`
      # inline annotation of a later assignment

      --- App.svelte ---

      <script>
        let x = 0
        let y = 0

        const kraboom = () => {
          x = 42 // @hmr:keep
        }

        const increment = () => { x++, y++ }
      </script>

      <button on:click={increment} />

      <x-focus>
        ::0 before: {x};{y}
        ::1 after: {x};{y}
      </x-focus>

      * * * * *

      ::0::
        before: 0;0
        ${clickButton()}
        before: 1;1
      ::1::
        after: 1;0
    `

    testHmr`
      # above annotation of a later assignment

      --- App.svelte ---

      <script>
        let x = 0
        let y = 0

        const kraboom = () => {
          // @hmr:keep
          x = 42
        }

        const increment = () => { x++, y++ }
      </script>

      <button on:click={increment} />

      <x-focus>
        ::0 before: {x};{y}
        ::1 after: {x};{y}
      </x-focus>

      * * * * *

      ::0::
        before: 0;0
        ${clickButton()}
        before: 1;1
      ::1::
        after: 1;0
    `

    testHmr`
      # inline annotation of a later multiple assignment

      --- App.svelte ---

      <script>
        let x = 0
        let y = 10
        let z = 20

        const kraboom = () => {
          x = 42,
          z = 43 // @hmr:keep
        }

        const increment = () => { x++, y++, z++ }
      </script>

      <button on:click={increment} />

      <x-focus>
        ::0 before: {x};{y};{z}
        ::1 after: {x};{y};{z}
      </x-focus>

      * * * * *

      ::0::
        before: 0;10;20
        ${clickButton()}
        before: 1;11;21
      ::1::
        after: 1;10;21
    `

    testHmr`
      # above annotation of a later multiple assignment

      --- App.svelte ---

      <script>
        let x = 0
        let y = 10
        let z = 20

        const kraboom = () => {
          // @hmr:keep
          x = 42,
          z = 43
        }

        const increment = () => { x++, y++, z++ }
      </script>

      <button on:click={increment} />

      <x-focus>
        ::0 before: {x};{y};{z}
        ::1 after: {x};{y};{z}
      </x-focus>

      * * * * *

      ::0::
        before: 0;10;20
        ${clickButton()}
        before: 1;11;21
      ::1::
        after: 1;10;21
    `
  })

  function testAnnotations(
    title,
    name,
    { inline, above, x_only, x_z },
    handler = describe
  ) {
    handler(title, () => {
      const testHmrIf = value => (value == null ? testHmr.skip : testHmr)

      testHmrIf(inline)`# inline annotation of a ${name}

        --- App.svelte ---

        <script>
          let x = 0
          let y = 0

          const kraboom = () => {
            ${inline}
          }

          const increment = () => { x++, y++ }
        </script>

        <button on:click={increment} />

        <x-focus>
          ::0 before: {x};{y}
          ::1 after: {x};{y}
        </x-focus>

        * * * * *

        ::0::
          before: 0;0
          ${clickButton()}
          before: 1;1
        ::1::
          after: 1;0
      `

      testHmrIf(above)`# above annotation of a ${name}

        --- App.svelte ---

        <script>
          let x = 0
          let y = 0

          const kraboom = () => {
            ${above}
          }

          const increment = () => { x++, y++ }
        </script>

        <button on:click={increment} />

        <x-focus>
          ::0 before: {x};{y}
          ::1 after: {x};{y}
        </x-focus>

        * * * * *

        ::0::
          before: 0;0
          ${clickButton()}
          before: 1;1
        ::1::
          after: 1;0
      `

      for (const [name, exp] of Object.entries(x_only)) {
        testHmr`# only x preserved: ${name.replace(/_/g, ' ')}

          --- App.svelte ---

          <script>
            let x = 0
            let y = 10
            let z = 20

            const kraboom = () => {
              ${exp}
            }

            const increment = () => { x++, y++, z++ }
          </script>

          <button on:click={increment} />

          <x-focus>
            ::0 before: {x};{y};{z}
            ::1 after: {x};{y};{z}
          </x-focus>

          * * * * *

          ::0::
            before: 0;10;20
            ${clickButton()}
            before: 1;11;21
          ::1::
            after: 1;10;20
        `
      }

      for (const [name, exp] of Object.entries(x_z)) {
        testHmr`# x and z preserved: ${name.replace(/_/g, ' ')}

          --- App.svelte ---

          <script>
            let x = 0
            let y = 10
            let z = 20

            const kraboom = () => {
              ${exp}
            }

            const increment = () => { x++, y++, z++ }
          </script>

          <button on:click={increment} />

          <x-focus>
            ::0 before: {x};{y};{z}
            ::1 after: {x};{y};{z}
          </x-focus>

          * * * * *

          ::0::
            before: 0;10;20
            ${clickButton()}
            before: 1;11;21
          ::1::
            after: 1;10;21
        `
      }
    })
  }

  testAnnotations.only = (...args) => testAnnotations(...args, describe.only)

  testAnnotations('x++', '++', {
    inline: 'x++ // @hmr:keep',
    above: `
      // @hmr:keep
      x++
    `,
    x_only: {},
    x_z: {
      inline_multiple_first: `
        x++, // @hmr:keep
        z++
      `,
      inline_multiple_last: `
        z++,
        x++ // @hmr:keep
      `,
      above_item: `
        z++,
        // @hmr:keep
        x++
      `,
      above_multiple: `
        // @hmr:keep
        x++, z++
      `,
      above_multiline: `
        // @hmr:keep
        x++,
        z++
      `,
    },
  })

  testAnnotations('x += 1', '+=', {
    inline: 'x += 1 // @hmr:keep',
    above: `
      // @hmr:keep
      x += 1
    `,
    x_only: {},
    x_z: {
      inline_multiple_first: `
        x += 1, // @hmr:keep
        z++
      `,
      inline_multiple_last: `
        z++,
        x += 1 // @hmr:keep
      `,
      above_item: `
        z++,
        // @hmr:keep
        x += 1
      `,
      above_multiple: `
        // @hmr:keep
        x += 1, z++
      `,
      above_multiline: `
        // @hmr:keep
        x += 1,
        z++
      `,
    },
  })

  testAnnotations('just x', 'x', {
    inline: 'x // @hmr:keep',
    above: `
      // @hmr:keep
      x
    `,
    x_only: {},
    x_z: {
      inline_multiple_first: `
        x, // @hmr:keep
        z++
      `,
      inline_multiple_last: `
        z++,
        x // @hmr:keep
      `,
      above_item: `
        z++,
        // @hmr:keep
        x
      `,
      above_multiple: `
        // @hmr:keep
        x, z++
      `,
      above_multiline: `
        // @hmr:keep
        x,
        z++
      `,
    },
  })

  testHmr`# mixed with noPreserveStateKey

    --- App.svelte ---

    <!-- @hmr:reset -->

    <script>
      let x = 0 // @hmr:keep
      let y = 0
      const increment = () => { x++, y++ }
    </script>

    <button on:click={increment} />

    <x-focus>
      ::0 before: {x};{y}
      ::1 after: {x};{y}
    </x-focus>

    * * * * *

    ::0::
      before: 0;0
      ${clickButton()}
      before: 1;1
    ::1::
      after: 0;0
  `

  // testHmr.only`# in template
  //
  //   --- App.svelte ---
  //
  //   <script>
  //     let x = 0
  //     let y = 0
  //   </script>
  //
  //   <button on:click={() => {
  //     x++ // @hmr:keep
  //     y++
  //   }} />
  //
  //   <x-focus>
  //     ::0 before: {x};{y}
  //     ::1 after: {x};{y}
  //   </x-focus>
  //
  //   * * * * *
  //
  //   ::0::
  //     before: 0;0
  //     ${clickButton()}
  //     before: 1;1
  //   ::1::
  //     after: 1;0
  // `
})
