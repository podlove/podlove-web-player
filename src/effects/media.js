export default mediaElement => action => {
  switch (action.type) {
    case 'PLAY':
      return mediaElement.play()
    case 'PAUSE':
      return mediaElement.pause()
    case 'UPDATE_PLAYTIME':
      return mediaElement.setCurrentTime(action.payload)
  }
}
