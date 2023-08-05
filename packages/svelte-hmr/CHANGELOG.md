# svelte-hmr

## 0.15.3

### Patch Changes

- Fix injecting imports whose paths contain special characters ([#78](https://github.com/sveltejs/svelte-hmr/pull/78))

## 0.15.2

### Patch Changes

- Accept Svelte 4 as peer dependency ([`3b4300c`](https://github.com/sveltejs/svelte-hmr/commit/3b4300cc8acc734c34dbfafc495c06d5d4d17803))

## 0.15.1

### Patch Changes

- support 'external' as value for compileOptions.css ([#63](https://github.com/sveltejs/svelte-hmr/pull/63))

## 0.15.0

### Minor Changes

- Add partialAccept option to fix HMR support of `<script context="module">` ([#58](https://github.com/sveltejs/svelte-hmr/pull/58))

## 0.14.12

### Patch Changes

- Fix acceptNamedExports option in tools that statically analyze accept (like Vite) ([`cafb9bb`](https://github.com/sveltejs/svelte-hmr/commit/cafb9bb7ea032d37b18fa4611542dd97ec81e197))

* Fix recovery after error, when possible ([#49](https://github.com/sveltejs/svelte-hmr/pull/49))

- change options.optimistic default value from true to false to fix buggy behavior on fatal runtime errors ([#53](https://github.com/sveltejs/svelte-hmr/pull/53))

## 0.14.11

### Patch Changes

- Fix preserving bind: directive (fixes [#43](https://github.com/sveltejs/svelte-hmr/issues/43)) ([#44](https://github.com/sveltejs/svelte-hmr/pull/44))

* Migrate README to svelte-hmr package (instead of monorepo root) ([#46](https://github.com/sveltejs/svelte-hmr/pull/46))

## 0.14.10

### Patch Changes

- added changesets ([#38](https://github.com/sveltejs/svelte-hmr/pull/38))

---

Please refer to [github releases](https://github.com/rixo/svelte-hmr/releases?after=v1.0.0) for older versions
