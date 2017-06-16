import keyboard from 'keyboardjs'

export default (key, onPress, onRelease) => {
  keyboard.bind(key, event => {
    event.preventDefault()
    onPress && onPress()
  }, event => {
    event.preventDefault()
    onRelease && onRelease()
  })
}
