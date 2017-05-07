import Clipboard from 'clipboard'

export default {
  bind (el) {
    return new Clipboard(el)
  }
}
