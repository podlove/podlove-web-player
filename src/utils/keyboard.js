import keyboard from 'keyboardjs'

export default (key, onPress, onRelease) => {
  keyboard.bind(key, event => {
    // Scope is in input or other dom element
    if (event.target.nodeName !== 'BODY') {
      return
    }

    event.preventDefault()
    onPress && onPress()
  }, event => {
    // Scope is in input or other dom element
    if (event.target.nodeName !== 'BODY') {
      return
    }

    event.preventDefault()
    onRelease && onRelease()
  })
}
