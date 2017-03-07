import mediaPlayer from '../../media-player'
import actions from '../actions'

const initMediaPlayer = (dispatch, config) =>
  mediaPlayer(config.audio, {
    setPlaytime: playtime => dispatch(actions.setPlaytime(playtime)),
    setBufferState: buffer => dispatch(actions.setBuffer(buffer)),
    setDuration: duration => dispatch(actions.setDuration(duration)),
    onPlay: () => dispatch(actions.playEvent()),
    onPause: () => dispatch(actions.pauseEvent()),
    onStop: () => dispatch(actions.stopEvent()),
    onLoad: () => dispatch(actions.loading())
  })

let mediaElement

export default (store, action) => {
  const state = store.getState()

  switch (action.type) {
    case 'INIT':
      mediaElement = initMediaPlayer(store.dispatch, action.payload)
      break
    case 'UI_PLAY':
      mediaElement.setPlaytime(state.playtime)
      mediaElement.play()
      break
    case 'UI_PAUSE':
      mediaElement.pause()
      break
    case 'UI_RESTART':
      mediaElement.setPlaytime(0)
      mediaElement.play()
      break
    case 'UPDATE_PLAYTIME':
      mediaElement.setPlaytime(action.payload)
      break
  }
}
