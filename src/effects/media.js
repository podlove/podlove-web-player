export default mediaElement => action => {
  switch (action.type) {
    case 'UI_PLAY':
      mediaElement.play()
      break
    case 'UI_PAUSE':
      mediaElement.pause()
      break
    case 'UI_RESTART':
      mediaElement.seek(0)
      mediaElement.play()
      break
    case 'UPDATE_PLAYTIME':
      mediaElement.seek(action.payload)
      break
  }
}
