import crypto from 'node:crypto'
import sanitizeHtml from 'sanitize-html'

/**
 * @template T
 * @param {() => T} fn
 * @returns T
 */
export const call = (fn) => fn()

export const randomId = () =>
  crypto.createHash('md5').update(`${Math.random()}${Date.now()}`).digest('hex')

// https://stackoverflow.com/a/40026669/1387519
const trimRegex =
  /(<(pre|script|style|textarea)[^]+?<\/\2)|(^|>)\s+|\s+(?=<|$)/g

const dedupSpaceRegex = / {2,}/g

/** @param {string | string[]} html */
export const normalizeHtml = (html) => {
  if (Array.isArray(html)) {
    return normalizeHtml(html.join(''))
  }

  let result = html
  // TODO This is very aggressive reformatting; it could break things that,
  //   unfortunately, might also be worthy of testing for HMR (whitespaces...)
  //   Maybe that should become an option of kind (or use a more respectfulj
  //   sanitization method).
  //
  // NOTE Many tests (of test utils) depends on this stripping of newlines,
  //   though.
  //
  result = result.replace(/\n+/g, ' ')
  result = result.trim()
  result = sanitizeHtml(result, {
    allowVulnerableTags: true,
    allowedTags: false,
    allowedAttributes: false,
    // selfClosing: false,
    // allowedSchemes: false,
    // allowedSchemesByTag: false,
    // allowedSchemesAppliedToAttributes: false,
  })
  result = result.replace(trimRegex, '$1$3')
  result = result.replace(dedupSpaceRegex, ' ')
  return result
}

/**
 * @template T
 * @param {T} x
 * @returns {T}
 */
export const identity = (x) => x

/**
 * @param {[searchValue: string | RegExp, replacer: string]} args
 * @returns {(s: string) => string}
 */
export const replace =
  (...args) =>
  (s) =>
    s.replace(...args)

/** @template T */
export const Deferred = () => {
  /** @type {(value: T) => void} */
  let resolve
  /** @type {(error: Error) => void} */
  let reject
  /** @type {Promise<T>} */
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  return { promise, resolve, reject }
}
