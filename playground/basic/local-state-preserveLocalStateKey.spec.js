import { test, describe, hmr, clickButton } from '$test'

test(
  'inline annotation',
  hmr([
    {
      files: {
        'App.svelte': ({ text }) => `
          <script>
            let x = 0 // @hmr:keep
            let y = 0
            const increment = () => { x++, y++ }
          </script>

          <button on:click={increment} />

          <x-focus>
            ${text ?? 'before: {x};{y}'}
          </x-focus>
        `,
      },
      steps: [
        { expect: { 'x-focus': 'before: 0;0' } },
        clickButton(),
        { expect: { 'x-focus': 'before: 1;1' } },
      ],
    },
    {
      name: 'edit',
      edit: {
        'App.svelte': { text: 'after: {x};{y}' },
      },
      expect: { 'x-focus': 'after: 1;0' },
    },
  ])
)

test(
  'above annotation',
  hmr([
    {
      files: {
        'App.svelte': ({ text }) => `
          <script>
            // @hmr:keep
            let x = 0
            let y = 0
            const increment = () => { x++, y++ }
          </script>

          <button on:click={increment} />

          <x-focus>
            ${text ?? 'before: {x};{y}'}
          </x-focus>
        `,
      },
      steps: [
        { expect: { 'x-focus': 'before: 0;0' } },
        clickButton(),
        { expect: { 'x-focus': 'before: 1;1' } },
      ],
    },
    {
      name: 'edit',
      edit: {
        'App.svelte': { text: 'after: {x};{y}' },
      },
      expect: { 'x-focus': 'after: 1;0' },
    },
  ])
)

test(
  'inline annotation of multiple declaration',
  hmr([
    {
      files: {
        'App.svelte': ({ text }) => `
          <script>
            let x = 0, z = 20 // @hmr:keep
            let y = 10
            const increment = () => { x++, y++, z++ }
          </script>

          <button on:click={increment} />

          <x-focus>
            ${text ?? 'before: {x};{y};{z}'}
          </x-focus>
        `,
      },
      steps: [
        { expect: { 'x-focus': 'before: 0;10;20' } },
        clickButton(),
        { expect: { 'x-focus': 'before: 1;11;21' } },
      ],
    },
    {
      name: 'edit',
      edit: {
        'App.svelte': { text: 'after: {x};{y};{z}' },
      },
      expect: { 'x-focus': 'after: 1;10;21' },
    },
  ])
)

test(
  'above annotation of multiple declaration',
  hmr([
    {
      files: {
        'App.svelte': ({ text }) => `
          <script>
            // @hmr:keep
            let x = 0,
                z = 20
            let y = 10
            const increment = () => { x++, y++, z++ }
          </script>

          <button on:click={increment} />

          <x-focus>
            ${text ?? 'before: {x};{y};{z}'}
          </x-focus>
        `,
      },
      steps: [
        { expect: { 'x-focus': 'before: 0;10;20' } },
        clickButton(),
        { expect: { 'x-focus': 'before: 1;11;21' } },
      ],
    },
    {
      name: 'edit',
      edit: {
        'App.svelte': { text: 'after: {x};{y};{z}' },
      },
      expect: { 'x-focus': 'after: 1;10;21' },
    },
  ])
)

describe('assignment', () => {
  test(
    'inline annotation of a later assignment',
    hmr([
      {
        files: {
          'App.svelte': ({ text }) => `
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
              ${text ?? 'before: {x};{y}'}
            </x-focus>
          `,
        },
        steps: [
          { expect: { 'x-focus': 'before: 0;0' } },
          clickButton(),
          { expect: { 'x-focus': 'before: 1;1' } },
        ],
      },
      {
        name: '',
        edit: {
          'App.svelte': { text: 'after: {x};{y}' },
        },
        expect: { 'x-focus': 'after: 1;0' },
      },
    ])
  )

  test(
    'above annotation of a later assignment',
    hmr([
      {
        files: {
          'App.svelte': ({ text }) => `
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
              ${text ?? 'before: {x};{y}'}
            </x-focus>
          `,
        },
        steps: [
          { expect: { 'x-focus': 'before: 0;0' } },
          clickButton(),
          { expect: { 'x-focus': 'before: 1;1' } },
        ],
      },
      {
        name: '',
        edit: {
          'App.svelte': { text: 'after: {x};{y}' },
        },
        expect: { 'x-focus': 'after: 1;0' },
      },
    ])
  )

  test(
    'inline annotation of a later multiple assignment',
    hmr([
      {
        files: {
          'App.svelte': ({ text }) => `
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
              ${text ?? 'before: {x};{y};{z}'}
            </x-focus>
          `,
        },
        steps: [
          { expect: { 'x-focus': 'before: 0;10;20' } },
          clickButton(),
          { expect: { 'x-focus': 'before: 1;11;21' } },
        ],
      },
      {
        name: '',
        edit: {
          'App.svelte': { text: 'after: {x};{y};{z}' },
        },
        expect: { 'x-focus': 'after: 1;10;21' },
      },
    ])
  )

  test(
    'above annotation of a later multiple assignment',
    hmr([
      {
        files: {
          'App.svelte': ({ text }) => `
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
              ${text ?? 'before: {x};{y};{z}'}
            </x-focus>
          `,
        },
        steps: [
          { expect: { 'x-focus': 'before: 0;10;20' } },
          clickButton(),
          { expect: { 'x-focus': 'before: 1;11;21' } },
        ],
      },
      {
        name: '',
        edit: {
          'App.svelte': { text: 'after: {x};{y};{z}' },
        },
        expect: { 'x-focus': 'after: 1;10;21' },
      },
    ])
  )

  /**
   * @param {string} title
   * @param {string} name
   * @param {{
   *   inline: ?string
   *   above?: string
   *   x_only: Record<string, string>
   *   x_z: Record<string, string>
   * }} options
   * @param {(name: string, handle: () => void) => void} handler
   */
  function testAnnotations(
    title,
    name,
    { inline, above, x_only, x_z },
    handler = describe
  ) {
    handler(title, () => {
      if (inline) {
        test(
          `inline annotation of a ${name}`,
          hmr([
            {
              files: {
                'App.svelte': ({ text }) => `
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
                    ${text ?? 'before: {x};{y}'}
                  </x-focus>
                `,
              },
              steps: [
                { expect: { 'x-focus': 'before: 0;0' } },
                clickButton(),
                { expect: { 'x-focus': 'before: 1;1' } },
              ],
            },
            {
              name: 'changes',
              edit: {
                'App.svelte': { text: 'after: {x};{y}' },
              },
              expect: { 'x-focus': 'after: 1;0' },
            },
          ])
        )
      }

      if (above) {
        test(
          `above annotation of a ${name}`,
          hmr([
            {
              files: {
                'App.svelte': ({ text }) => `
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
                    ${text ?? 'before: {x};{y}'}
                  </x-focus>
                `,
              },
              steps: [
                { expect: { 'x-focus': 'before: 0;0' } },
                clickButton(),
                { expect: { 'x-focus': 'before: 1;1' } },
              ],
            },
            {
              name: 'changes',
              edit: {
                'App.svelte': { text: 'after: {x};{y}' },
              },
              expect: { 'x-focus': 'after: 1;0' },
            },
          ])
        )
      }

      for (const [name, exp] of Object.entries(x_only)) {
        test(
          `only x preserved: ${name.replace(/_/g, ' ')}`,
          hmr([
            {
              files: {
                'App.svelte': ({ text }) => `
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
                    ${text ?? 'before: {x};{y};{z}'}
                  </x-focus>
                `,
              },
              steps: [
                { expect: { 'x-focus': 'before: 0;10;20' } },
                clickButton(),
                { expect: { 'x-focus': 'before: 1;11;21' } },
              ],
            },
            {
              name: 'change',
              edit: {
                'App.svelte': { text: 'after: {x};{y};{z}' },
              },
              expect: { 'x-focus': 'after: 1;10;20' },
            },
          ])
        )
      }

      for (const [name, exp] of Object.entries(x_z)) {
        test(
          `x and z preserved: ${name.replace(/_/g, ' ')}`,
          hmr([
            {
              files: {
                'App.svelte': ({ text }) => `
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
                    ${text ?? 'before: {x};{y};{z}'}
                  </x-focus>
                `,
              },
              steps: [
                { expect: { 'x-focus': 'before: 0;10;20' } },
                clickButton(),
                { expect: { 'x-focus': 'before: 1;11;21' } },
              ],
            },
            {
              name: 'change',
              edit: {
                'App.svelte': { text: 'after: {x};{y};{z}' },
              },
              expect: { 'x-focus': 'after: 1;10;21' },
            },
          ])
        )
      }
    })
  }

  /**
   * @param {[
   *   Parameters<typeof testAnnotations>[0],
   *   Parameters<typeof testAnnotations>[1],
   *   Parameters<typeof testAnnotations>[2]
   * ]} args
   */
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

  test(
    'mixed with noPreserveStateKey',
    hmr([
      {
        files: {
          'App.svelte': ({ text }) => `
            <!-- @hmr:reset -->

            <script>
              let x = 0 // @hmr:keep
              let y = 0
              const increment = () => { x++, y++ }
            </script>

            <button on:click={increment} />

            <x-focus>
              ${text ?? 'before: {x};{y}'}
            </x-focus>
          `,
        },
        steps: [
          { expect: { 'x-focus': 'before: 0;0' } },
          clickButton(),
          { expect: { 'x-focus': 'before: 1;1' } },
        ],
      },
      {
        name: 'change',
        edit: {
          'App.svelte': { text: 'after: {x};{y}' },
        },
        expect: { 'x-focus': 'after: 0;0' },
      },
    ])
  )
})
