import Clipboard from 'clipboard'

export default {
  bind (el, binding, vnode, oldVnode) {
    return new Clipboard(el)
  }
}
