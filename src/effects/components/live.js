import { get } from 'lodash'

import { handleActions } from 'utils/effects'

import actions from 'store/actions'
import { INIT, LOADING, LOADED, PAUSE, PLAY, IDLE, NETWORK_EMPTY, NETWORK_NO_SOURCE, ERROR_MISSING_AUDIO_FILES } from 'store/types'

const hasMeta = (show, episode) => episode.poster || show.poster || show.title || episode.title || episode.subtitle

export default handleActions({
  [INIT]: ({ dispatch }, action, state) => {
    const episode = get(state, 'episode', {})
    const show = get(state, 'show', {})
    const runtime = get(state, 'runtime', {})

    // Meta
    if (hasMeta(show, episode)) {
      dispatch(actions.toggleInfo(true))
    }

    // Audio Modifiers
    if (runtime.platform === 'desktop') {
      dispatch(actions.toggleVolumeSlider(true))
    }

    // Everything else without conditions
    dispatch(actions.toggleComponentTab('info', true))
    dispatch(actions.toggleComponentTab('audio', true))
    dispatch(actions.toggleInfoPoster(true))
    dispatch(actions.showPauseButton())
  },

  [LOADING]: ({ dispatch }) => dispatch(actions.showLoadingButton()),
  [LOADED]: ({ dispatch }, { payload }) => payload.paused ? dispatch(actions.showPauseButton()) : dispatch(actions.showPlayingButton()),

  [PLAY]: ({ dispatch }) => {
    // Default behaviour
    dispatch(actions.showPlayingButton())

    // Error Fallbacks
    dispatch(actions.toggleInfo(true))
    dispatch(actions.toggleError(false))
  },

  [PAUSE]: ({ dispatch }) => dispatch(actions.showPauseButton()),

  [IDLE]: ({ dispatch }) => {
    dispatch(actions.showPauseButton())
    dispatch(actions.toggleChapterControls(true))
    dispatch(actions.toggleSteppersControls(true))
    dispatch(actions.toggleProgressBar(true))
  },

  [NETWORK_EMPTY]: ({ dispatch }) => dispatch(actions.showRetryButton()),
  [NETWORK_NO_SOURCE]: ({ dispatch }) => dispatch(actions.showRetryButton()),

  [ERROR_MISSING_AUDIO_FILES]: ({ dispatch }) => {
    dispatch(actions.toggleInfo(false))
    dispatch(actions.toggleError(true))
    dispatch(actions.toggleButtonControl(false))
  }
})
