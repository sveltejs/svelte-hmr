/* global document */

const removeElement = el => el && el.parentNode && el.parentNode.removeChild(el)

const ErrorOverlay = () => {
  const errors = []

  const style = {
    section: `
      display: none;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 32px;
      background: rgba(0, 0, 0, .85);
      font-family: Menlo, Consolas, monospace;
      font-size: large;
      color: rgb(232, 232, 232);
    `,
    h1: `
      margin-top: 0;
      color: #E36049;
      font-size: large;
      font-weight: normal;
    `,
    h2: `
      margin: 32px 0 0;
      font-size: large;
      font-weight: normal;
    `,
    pre: ``,
  }

  let el

  const createOverlay = () => {
    const title = 'Failed to init component'
    const h1 = document.createElement('h1')
    h1.textContent = title
    const section = document.createElement('section')
    section.appendChild(h1)
    section.style = style.section
    h1.style = style.h1
    const target = document.body
    target.appendChild(section)
    return section
  }

  const show = () => {
    el.style.display = 'block'
  }

  const hide = () => {
    el.style.display = 'none'
  }

  const popError = wrap => {
    const index = errors.indexOf(wrap)
    if (index === -1) return
    errors.splice(index, 1)
    if (errors.length === 0) {
      hide()
    }
  }

  const addError = (error, title) => {
    let removed = false

    const h2 = document.createElement('h2')
    h2.textContent = title
    h2.style = style.h2
    const pre = document.createElement('pre')
    pre.textContent = (error && error.stack) || error
    const div = document.createElement('div')
    div.appendChild(h2)
    div.appendChild(pre)

    el.appendChild(div)

    const wrap = { error } // ensure unique ref, even if same error instance
    errors.push(wrap)
    if (errors.length === 1) {
      show()
    }
    return () => {
      if (removed) return
      removed = true
      removeElement(div)
      popError(wrap)
    }
  }

  el = createOverlay()

  return {
    addError,
  }
}

export default class ProxyAdapterDom {
  constructor(instance) {
    this.instance = instance
    this.insertionPoint = null

    this.afterMount = this.afterMount.bind(this)
    this.rerender = this.rerender.bind(this)
  }

  static getErrorOverlay() {
    if (!this.errorOverlay) {
      this.errorOverlay = ErrorOverlay()
    }
    return this.errorOverlay
  }

  dispose() {
    // Component is being destroyed, detaching is not optional in Svelte3's
    // component API, so we can dispose of the insertion point in every case.
    if (this.insertionPoint) {
      removeElement(this.insertionPoint)
      this.insertionPoint = null
    }
    this.clearError()
  }

  // NOTE afterMount CAN be called multiple times (e.g. keyed list)
  afterMount(target, anchor) {
    const {
      instance: { debugName },
    } = this
    if (!this.insertionPoint) {
      this.insertionPoint = document.createComment(debugName)
    }
    target.insertBefore(this.insertionPoint, anchor)
  }

  rerender() {
    this.clearError()
    const {
      instance: { refreshComponent },
      insertionPoint,
    } = this
    if (!insertionPoint) {
      const err = new Error('Cannot rerender: Missing insertion point')
      err.hmrFatal = true
      return err
    }
    refreshComponent(insertionPoint.parentNode, insertionPoint)
  }

  renderError(err) {
    const {
      instance: { debugName },
    } = this
    const title = debugName || err.moduleName || 'Error'
    this.popError = this.constructor.getErrorOverlay().addError(err, title)
  }

  clearError() {
    if (this.popError) {
      this.popError()
      this.popError = null
    }
  }
}
