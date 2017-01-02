export default (state = false, action) => {
  switch (action.type) {
    case 'PLAY':
      return true
    case 'UI_PLAY':
      return true
    case 'PAUSE':
      return false
    case 'UI_PAUSE':
      return false
    default:
      return state
  }
}
