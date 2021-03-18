/**
 * Injects a `{}*` CSS rule to force Svelte compiler to scope every elements.
 */
export const injectScopeEverythingCssRule = (parse, code) => {
  const { css } = parse(code)
  if (!css) return code
  const {
    content: { end },
  } = css
  return code.slice(0, end) + '*{}' + code.slice(end)
}

const hmrTransformStart = 'import * as ___SVELTE_HMR_HOT_API from'

export const normalizeNonJs = code => {
  const indexHmrTransform = code.indexOf(hmrTransformStart)
  if (indexHmrTransform !== -1) code = code.slice(0, indexHmrTransform)
  // Svelte now adds locations in dev mode, code locations can change when
  // CSS change, but we're unaffected (not real behaviour changes)
  code = code.replace(/\badd_location\s*\([^)]*\)\s*;?/g, '')
  return code
}
