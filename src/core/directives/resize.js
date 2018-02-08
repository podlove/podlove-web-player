/* global MutationObserver */

export default {
  bind (el, { value }) {
    const observer = new MutationObserver(value)

    observer.observe(el, { childList: true })
    window.addEventListener('resize', value)
  }
}
