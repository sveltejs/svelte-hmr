# Svelte HMR Spec

Test suite for Svelte 3 HMR.

The whole project is only the tests. And a cool cli to run them on various targets.

## Install

If you just want to run the tests, you can install the package from npm:

```bash
npm install --global svelte-hmr-spec
```

... but if you're here, you most probably want to _work_ with the tests. So clone & install that instead:

```bash
git clone git@github.com:rixo/svelte-hmr-spec.git
cd svelte-hmr-spec
yarn
# yarn global add doesn't work for me but you might have a better luck
npm install --global .
```

## Usage

See inline help for an up to date description of available cli options:

```bash
svhs --help
```

To run the tests on one of the bundled apps (that are based on [svelte-template-hot](https://github.com/rixo/svelte-template-hot/tree/test-hmr) and [svelte-template-webpack-hot](https://github.com/rixo/demo-svelte3-hmr/tree/test-hmr)):

```bash
svhs rollup
# or
svhs nollup
# or
svhs webpack
```

To run the tests on a custom target, use `svhs ./path-to-your-app` (defaults to cwd). Example:

```bash
git clone https://github.com/rixo/svelte-template-hot
cd demo-svelte-nollup
npm install

svhs --watch
```
