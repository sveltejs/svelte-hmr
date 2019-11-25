# svelte-hmr

HMR common utils for Svelte 3.

This project only provides shared primitives for implementing Svelte HMR in any bundler, it does nothing useful on its own. If you _are_ really developing a bundler adapter / plugin... Sorry, no docs for now! Drop me a line, I'd be happy to help! You can create an issue here, or contact me directly in Svelte's Discord channel.

If what you're after is to add HMR to your Svelte project, you'll find the relevant tools and information in the following projects.

## Rollup / Nollup

- [svelte-template-hot] **`<-` Recommended starting point**
- [rollup-plugin-svelte-hot]

### HMR support for Rollup

Rollup does not natively support HMR. You'll need to use one of the following solution. The best way to get started is to refer to [svelte-template-hot], that demonstrates usage of both.

- [rollup-plugin-hot]
- [Nollup][nollup]

## Webpack

Documentation & examples for Webpack are currently lagging behind...

- [svelte-loader-hot]
- [svelte-template-webpack-hot]

## Sapper

Sapper can be supported with Webpack's loader. The link bellow is still very much a work in progress (no docs at time of writting), but I'm adding it for future reference.

- [sapper-template-hot#webpack](https://github.com/rixo/sapper-template-hot#webpack)

## Svelte Native

The official Svelte Native template already includes HMR support.

- [svelte-native-template]

[nollup]: https://github.com/PepsRyuu/nollup
[rollup-plugin-hot]: https://github.com/rixo/rollup-plugin-hot
[rollup-plugin-svelte-hot]: https://github.com/rixo/rollup-plugin-svelte-hot
[rollup-plugin-svelte]: https://github.com/rollup/rollup-plugin-svelte
[svelte-template-hot]: https://github.com/rixo/svelte-template-hot
[svelte-template]: https://github.com/sveltejs/template
[svelte-native-template]: https://github.com/halfnelson/svelte-native-template
[svelte-loader-hot]: https://github.com/rixo/svelte-loader-hot
[svelte-template-webpack-hot]: https://github.com/rixo/svelte-template-webpack-hot
