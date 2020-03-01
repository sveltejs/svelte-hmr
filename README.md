# svelte-hmr

HMR commons for Svelte 3.

This packages provides shared dependencies for implementing Svelte HMR in any bundler plugins.

If you want to _use_ HMR in your Svelte project, what you need is a HMR enabled plugin for your bundler (e.g. Rollup or Webpack). See available options in the following list.

On the other hand, if you are really developing a plugin... Sorry, no docs for now! Drop me a line, I'd be happy to help!

## Rollup / Nollup

- [svelte-template-hot] :arrow_left: **Recommended starting point**
- [rollup-plugin-svelte-hot]

### HMR support for Rollup

Rollup does not natively support HMR. You'll need to use one of the following solutions. The best way to get started is to refer to [svelte-template-hot], that demonstrates usage of both.

- [rollup-plugin-hot]
- [Nollup][nollup]

## Webpack

Documentation & examples for Webpack are currently lagging behind...

- [svelte-loader-hot]
- [svelte-template-webpack-hot]

## Sapper

Sapper can be supported with Webpack's loader. The link bellow is still very much a work in progress (no docs at time of writing), but I'm adding it for future reference.

- [sapper-template-hot#webpack](https://github.com/rixo/sapper-template-hot#webpack)

Some initial work has also been made on supporting Sapper with Rollup, and basic support for simple cases is available. But this one is still in very early stages (and, again, poorly documented for now, sorry). I could really use some help with this one actually, if you're in the mood ;)

- [sapper-template-hot#rollup](https://github.com/rixo/sapper-template-hot#rollup)

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

## License

[ISC](LICENSE)
