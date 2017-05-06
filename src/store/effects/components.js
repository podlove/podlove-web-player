import { get } from 'lodash'
import actions from '../actions'

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
      store.dispatch(actions.showRemainingButton())
      break
    case 'INIT':
      const state = store.getState()
      const chapters = get(state, 'chapters', [])
      const reference = get(state, 'reference', {})

      if (chapters.length > 0) {
        store.dispatch(actions.toggleChaptersTab(true))
      }

      if ((reference.config && reference.share) || reference.origin) {
        store.dispatch(actions.toggleShareTab(true))
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
