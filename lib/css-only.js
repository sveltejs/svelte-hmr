export const normalizeNonJs = (code, cssHash = null) => {
  const indexHmrTransform = code.indexOf(
    'import * as ___SVELTE_HMR_HOT_API from'
  )
  if (indexHmrTransform !== -1) code = code.slice(0, indexHmrTransform)
  if (cssHash !== null) {
    // ignore css hashes in the code (that have changed, necessarily)
    code = code.replace(new RegExp('\\b' + cssHash + '\\b', 'g'), '')
  }
  // Svelte now adds locations in dev mode, code locations can change when
  // CSS change, but we're unaffected (not real behaviour changes)
  code = code.replace(/\badd_location\s*\([^)]*\)\s*;?/g, '')
  return code
}
