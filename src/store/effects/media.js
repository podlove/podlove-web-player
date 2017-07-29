import { get } from 'lodash'

import actions from '../actions'

let mediaElement = null

const initMediaPlayer = (mediaPlayer, dispatch, audioFiles) => {
  return mediaPlayer(audioFiles, {
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
      const audioFiles = get(action.payload, 'audio', []).reduce((result, file) => {
        return [
          ...result,
          file.url
        ]
      }, [])

      if (audioFiles.length === 0) {
        store.dispatch(actions.errorMissingAudioFiles())
      } else {
        mediaElement = initMediaPlayer(mediaPlayer, store.dispatch, audioFiles)
      }

      break
    case 'UI_PLAY':
      mediaElement && mediaElement.seek(state.playtime)
      mediaElement && mediaElement.play()
      break
    case 'UI_PAUSE':
      mediaElement && mediaElement.pause()
      break
    case 'UI_RESTART':
      mediaElement && mediaElement.seek(0)
      mediaElement && mediaElement.play()
      break
    case 'UPDATE_PLAYTIME':
      mediaElement && mediaElement.seek(action.payload)
      break
    case 'SET_VOLUME':
      mediaElement && mediaElement.volume(action.payload)
      break
    case 'SET_RATE':
      mediaElement && mediaElement.rate(action.payload)
      break
    case 'MUTE':
      mediaElement && mediaElement.mute(true)
      break
    case 'UNMUTE':
      mediaElement && mediaElement.mute(false)
      break
  }
}
