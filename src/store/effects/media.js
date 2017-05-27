import { get } from 'lodash'

import actions from '../actions'

let mediaElement = null

const initMediaPlayer = (mediaPlayer, dispatch, config) => {
  return mediaPlayer(config.audio, {
    setPlaytime: playtime => dispatch(actions.setPlaytime(playtime)),
    setBufferState: buffer => dispatch(actions.setBuffer(buffer)),
    setDuration: duration => dispatch(actions.setDuration(duration)),
    onPlay: () => dispatch(actions.playEvent()),
    onPause: () => dispatch(actions.pauseEvent()),
    onStop: () => dispatch(actions.stopEvent()),
    onLoad: () => dispatch(actions.loading()),
    onError: () => dispatch(actions.errorLoad())
  })
}

export default mediaPlayer => (store, action) => {
  const state = store.getState()

  switch (action.type) {
    case 'INIT':
      const audioFiles = get(action.payload, 'audio', [])

      if (audioFiles.length === 0) {
        store.dispatch(actions.errorMissingAudioFiles())
      } else {
        mediaElement = initMediaPlayer(mediaPlayer, store.dispatch, action.payload)
      }

      break
    case 'UI_PLAY':
      mediaElement && mediaElement.setPlaytime(state.playtime)
      mediaElement && mediaElement.play()
      break
    case 'UI_PAUSE':
      mediaElement && mediaElement.pause()
      break
    case 'UI_RESTART':
      mediaElement && mediaElement.setPlaytime(0)
      mediaElement && mediaElement.play()
      break
    case 'UPDATE_PLAYTIME':
      mediaElement && mediaElement.setPlaytime(action.payload)
      break
    case 'SET_VOLUME':
      mediaElement && mediaElement.volume(action.payload)
      break
    case 'SET_RATE':
      mediaElement && mediaElement.rate(action.payload)
      break
  }
}
