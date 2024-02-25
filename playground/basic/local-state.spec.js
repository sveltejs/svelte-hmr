import { test, describe, hmr, clickButton } from '$test'

test(
  'preserves local state when component changes',
  hmr([
    {
      files: {
        'App.svelte': ({ text }) => `
          <!-- @hmr:keep-all -->

          <script>
            let x = 0
            const increment = () => { x++ }
          </script>

          <button on:click={increment} />

          <x-focus>
            ${text ?? 'before: {x}'}
          </x-focus>
        `,
      },
      steps: [
        { expect: { 'x-focus': 'before: 0' } },
        clickButton(),
        { expect: { 'x-focus': 'before: 1' } },
      ],
    },
    {
      name: 'change',
      edit: {
        'App.svelte': { text: 'after: {x}' },
      },
      expect: { 'x-focus': 'after: 1' },
    },
  ])
)

for (const { name, steps } of [
  {
    name: 'preserves local variables in simpler component (no definition)',
    steps: [
      { script: "let a = 'foo'", expect: 'foo' },
      { script: "let a = 'bar'", expect: 'foo' },
    ],
  },
  {
    name: 'preserves value of props that become local',
    steps: [
      { script: "export let a = 'foo'", expect: 'foo' },
      { script: "let a = 'bar'", expect: 'foo' },
    ],
  },
  {
    name: 'preserves value of locals that become props',
    steps: [
      { script: "let a = 'foo'", expect: 'foo' },
      { script: "export let a = 'bar'", expect: 'foo' },
    ],
  },
  {
    name: 'preserves value of const that become local',
    steps: [
      { script: "const a = 'foo'", expect: 'foo' },
      { script: "let a = 'bar'", expect: 'foo' },
    ],
  },
  {
    name: "don't preserve value of exports that become const",
    steps: [
      { script: "export let a = 'foo'", expect: 'foo' },
      { script: "const a = 'bar'", expect: 'bar' },
    ],
  },
  {
    name: 'sanity check: preserves local state',
    steps: [
      { script: 'let a = 0; a = 1;', expect: '1' },
      { script: 'let a = 0;', expect: '1' },
    ],
  },
]) {
  test(
    name,
    hmr([
      {
        files: {
          'App.svelte': ({ script }) => `
            <!-- @hmr:keep-all -->

            <script>
              ${script ?? steps[0].script}
            </script>

            {a}
          `,
        },
        expect: steps[0].expect,
      },
      {
        name: 'change',
        edit: {
          'App.svelte': { script: steps[1].script },
        },
        expect: steps[1].expect,
      },
    ])
  )
}

describe('@!hmr', () => {
  for (const { name, steps, annotation: defaultAnnotation = '' } of [
    {
      name: 'sanity check: preserves local state',
      steps: [
        {
          script: 'let a = 0; a = 1;',
          annotation: '<!-- @hmr:keep-all -->',
          expect: '1',
        },
        {
          script: 'let a = 0;',
          annotation: '<!-- @hmr:keep-all -->',
          expect: '1',
        },
      ],
    },
    {
      name: 'force noPreserveState from markup',
      steps: [
        {
          script: 'let a = 0; a = 1;',
          annotation: '<!-- @hmr:keep-all -->',
          expect: '1',
        },
        {
          script: 'let a = 0;',
          annotation: '<!-- @!hmr -->',
          expect: '0',
        },
      ],
    },
    {
      name: 'force noPreserveState from script',
      steps: [
        {
          script: 'let a = 0; a = 1;',
          expect: '1',
        },
        {
          script: 'let a = 0; // @!hmr',
          expect: '0',
        },
      ],
    },
    {
      name: 'only applies to the update that contains the flag',
      annotation: '<!-- @hmr:keep-all -->',
      steps: [
        {
          script: 'let a = 0; a = 1;',
          expect: '1',
        },
        {
          script: "'@!hmr'; let a = 2;",
          expect: '2',
        },
        {
          script: 'let a = 4;',
          expect: '2',
        },
      ],
    },
  ]) {
    test(
      name,
      hmr([
        {
          files: {
            'App.svelte': ({ script, annotation }) => `
              ${annotation ?? steps[0]?.annotation ?? defaultAnnotation}

              <script>
                ${script ?? steps[0].script}
              </script>

              {a}
            `,
          },
          expect: steps[0].expect,
        },
        ...steps.slice(1).map((step, i) => ({
          name: `change ${i + 1}`,
          edit: {
            'App.svelte': step,
          },
          expect: step.expect,
        })),
      ])
    )
  }
})

test(
  'does not crash when props are added to a component',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import Child from './Child.svelte'
          </script>

          <Child />
        `,
        'Child.svelte': ({ script, text }) => `
          ${script ?? ''}
          ${text ?? 'I am Child'}
        `,
      },
      expect: 'I am Child',
    },
    {
      name: 'prop is added',
      edit: {
        'Child.svelte': {
          script: `
            <script>
              export let x = 'x'
            </script>
          `,
          text: 'I am Child.{x}',
        },
      },
      expect: 'I am Child.x',
    },
  ])
)

test(
  'does not crash when props are removed from a component',
  hmr([
    {
      files: {
        'App.svelte': `
          <script>
            import Child from './Child.svelte'
          </script>

          <Child />
        `,
        'Child.svelte': ({ script, text }) => `
          ${
            script ??
            `
              <script>
                export let x = 'x'
              </script>
            `
          }
          ${text ?? 'I am Child.{x}'}
        `,
      },
      expect: 'I am Child.x',
    },
    {
      name: 'prop is removed',
      edit: {
        'Child.svelte': {
          script: '',
          text: 'I am Child',
        },
      },
      expect: 'I am Child',
    },
  ])
)
