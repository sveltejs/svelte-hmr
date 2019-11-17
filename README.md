# svelte-hmr

HMR common utils for Svelte 3.

This project only provides shared primitives for implementing Svelte HMR in any bundler, it does nothing useful on its own. If you _are_ really developing a bundler adapter... Sorry, no docs for now! Drop me a line, I'd be happy to help!

If what you're after is rather to add HMR support to your Svelte project, here are the resources that you need.

## Rollup / Nollup

Rollup itself doesn't do HMR. For HMR with Rollup, you'll need to use either [Nollup][nollup], or [rollup-plugin-hot].

Once you've got HMR, you want specific support for Svelte. For that you need [rollup-plugin-svelte-hot]. It is a clone of official [rollup-plugin-svelte] with added HMR support. It is intended to be used as a drop-in replacement of official plugin. It supports both Nollup & Rollup with hot plugin. It will apply HMR updates to Svelte components automatically for you.

You can see all this in action in [svelte-template-hot]. It is a clone of official [Svelte template for Rollup][svelte-template] with, you've guessed it, added HMR support. You can use it as a degit-able template for a new project, or as a reference to get your own config right.

[nollup]: https://github.com/PepsRyuu/nollup
[rollup-plugin-hot]: https://github.com/rixo/rollup-plugin-hot
[rollup-plugin-svelte-hot]: https://github.com/rixo/rollup-plugin-svelte-hot
[rollup-plugin-svelte]: https://github.com/rollup/rollup-plugin-svelte
[svelte-template-hot]: https://github.com/rixo/svelte-template-hot
[svelte-template]: https://github.com/sveltejs/template

## Webpack

## Sapper

## Svelte Native
