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
      const tabs = get(state, 'components.visibleTabs', [])

      // Tabs
      if (tabs.includes('chapters') && hasChapters(chapters)) {
        store.dispatch(actions.toggleChaptersTab(true))
      }

      if (tabs.includes('share')) {
        store.dispatch(actions.toggleShareTab(true))
      }

      if (tabs.includes('info')) {
        store.dispatch(actions.toggleInfoTab(true))
      }

      if (tabs.includes('download') && hasFiles(downloadFiles)) {
        store.dispatch(actions.toggleDownloadTab(true))
      }

      if (tabs.includes('audio')) {
        store.dispatch(actions.toggleAudioTab(true))
      }

      // Meta
      if (hasMeta(show, episode)) {
        store.dispatch(actions.toggleInfo(true))
      }

      break
    case 'STOP':
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
