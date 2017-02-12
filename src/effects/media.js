import {timeToSeconds} from 'utils/time'

export default mediaElement => action => {
  switch (action.type) {
    case 'INIT':
      mediaElement.seek(timeToSeconds(action.payload.playtime) || 0)
      break
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
