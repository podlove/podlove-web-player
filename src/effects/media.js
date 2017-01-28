export default mediaElement => action => {
  switch (action.type) {
    case 'UI_PLAY':
      return mediaElement.play()
    case 'UI_PAUSE':
      return mediaElement.pause()
    case 'UI_RESTART':
      mediaElement.seek(0)
      return mediaElement.play()
    case 'UPDATE_PLAYTIME':
      return mediaElement.seek(action.payload)
  }
}
