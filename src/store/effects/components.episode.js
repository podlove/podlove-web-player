import { get } from 'lodash'
import actions from '../actions'

const hasChapters = chapters => chapters.length > 0
const hasMeta = (show, episode) => episode.poster || show.poster || show.title || episode.title || episode.subtitle
const hasFiles = files => files.length > 0

export default (store, action) => {
  switch (action.type) {
    case 'LOADING':
      store.dispatch(actions.showLoadingButton())
      break
    case 'LOADED':
      if (action.payload.paused) {
        store.dispatch(actions.showPauseButton())
      } else {
        store.dispatch(actions.showPlayingButton())
      }
      break
    case 'PLAY':
      // Default behaviour
      store.dispatch(actions.showPlayingButton())
      store.dispatch(actions.toggleProgressBar(true))
      store.dispatch(actions.toggleChapterControls(true))
      store.dispatch(actions.toggleSteppersControls(true))

      // Error Fallbacks
      store.dispatch(actions.toggleInfo(true))
      store.dispatch(actions.toggleError(false))
      break
    case 'PAUSE':
      store.dispatch(actions.showPauseButton())
      break
    case 'IDLE':
      store.dispatch(actions.showPauseButton())
      store.dispatch(actions.toggleChapterControls(true))
      store.dispatch(actions.toggleSteppersControls(true))
      store.dispatch(actions.toggleProgressBar(true))
      break
    case 'INIT':
      const state = store.getState()
      const chapters = get(state, 'chapters', [])
      const downloadFiles = get(state, 'download.files', [])
      const episode = get(state, 'episode', {})
      const show = get(state, 'show', {})
      const runtime = get(state, 'runtime', {})

      // Tabs
      if (hasChapters(chapters)) {
        store.dispatch(actions.toggleComponentTab('chapters', true))
      }

      if (hasFiles(downloadFiles)) {
        store.dispatch(actions.toggleComponentTab('download', true))
      }

      // Meta
      if (hasMeta(show, episode)) {
        store.dispatch(actions.toggleInfo(true))
      }

      // Audio Modifiers
      if (runtime.platform === 'desktop') {
        store.dispatch(actions.toggleVolumeSlider(true))
      }

      // Everything else without conditions
      store.dispatch(actions.toggleComponentTab('share', true))
      store.dispatch(actions.toggleComponentTab('info', true))
      store.dispatch(actions.toggleComponentTab('audio', true))
      store.dispatch(actions.toggleRateSlider(true))
      store.dispatch(actions.toggleInfoPoster(true))
      break
    case 'END':
      store.dispatch(actions.showReplayButton())
      break
    case 'ERROR_LOAD':
      store.dispatch(actions.toggleInfo(false))
      store.dispatch(actions.toggleError(true))
      store.dispatch(actions.showRetryButton())
      store.dispatch(actions.toggleProgressBar(false))
      store.dispatch(actions.toggleChapterControls(false))
      store.dispatch(actions.toggleSteppersControls(false))
      break
    case 'ERROR_MISSING_AUDIO_FILES':
      store.dispatch(actions.toggleInfo(false))
      store.dispatch(actions.toggleError(true))
      store.dispatch(actions.toggleButtonControl(false))
      store.dispatch(actions.toggleProgressBar(false))
      store.dispatch(actions.toggleChapterControls(false))
      store.dispatch(actions.toggleSteppersControls(false))
      break
  }
}
