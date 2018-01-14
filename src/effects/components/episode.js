import { get, noop } from 'lodash'

import actions from 'store/actions'
import { INIT, LOADING, LOADED, PLAY, PAUSE, IDLE, SET_TRANSCRIPTS, END, NETWORK_EMPTY, NETWORK_NO_SOURCE, ERROR_MISSING_AUDIO_FILES } from 'store/types'

import { handleActions } from 'utils/effects'

const hasChapters = chapters => chapters.length > 0
const hasMeta = (show, episode) => episode.poster || show.poster || show.title || episode.title || episode.subtitle
const hasFiles = files => files.length > 0

const networkError = ({ dispatch }) => {
  dispatch(actions.toggleInfo(false))
  dispatch(actions.toggleError(true))
  dispatch(actions.showRetryButton())
  dispatch(actions.toggleProgressBar(false))
  dispatch(actions.toggleChapterControls(false))
  dispatch(actions.toggleSteppersControls(false))
}

export default handleActions({
  [INIT]: ({ dispatch }, action, state) => {
    const chapters = get(state, 'chapters', [])
    const downloadFiles = get(state, 'download.files', [])
    const episode = get(state, 'episode', {})
    const show = get(state, 'show', {})
    const runtime = get(state, 'runtime', {})

    // Tabs
    if (hasChapters(chapters)) {
      dispatch(actions.toggleComponentTab('chapters', true))
    }

    if (hasFiles(downloadFiles)) {
      dispatch(actions.toggleComponentTab('download', true))
    }

    // Meta
    if (hasMeta(show, episode)) {
      dispatch(actions.toggleInfo(true))
    }

    // Audio Modifiers
    if (runtime.platform === 'desktop') {
      dispatch(actions.toggleVolumeSlider(true))
    }

    // Everything else without conditions
    dispatch(actions.toggleComponentTab('share', true))
    dispatch(actions.toggleComponentTab('info', true))
    dispatch(actions.toggleComponentTab('audio', true))
    dispatch(actions.toggleRateSlider(true))
    dispatch(actions.toggleInfoPoster(true))
  },

  [LOADING]: ({ dispatch }) => dispatch(actions.showLoadingButton()),

  [LOADED]: ({ dispatch }, { payload }) => payload.paused ? dispatch(actions.showPauseButton()) : dispatch(actions.showPlayingButton()),

  [PLAY]: ({ dispatch }) => {
    // Default behaviour
    dispatch(actions.showPlayingButton())
    dispatch(actions.toggleProgressBar(true))
    dispatch(actions.toggleChapterControls(true))
    dispatch(actions.toggleSteppersControls(true))

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

  [SET_TRANSCRIPTS]: ({ dispatch }, { payload }) => payload.length > 0 ? dispatch(actions.toggleComponentTab('transcripts', true)) : noop,

  [END]: ({ dispatch }) => dispatch(actions.showReplayButton()),

  [NETWORK_EMPTY]: networkError,
  [NETWORK_NO_SOURCE]: networkError,

  [ERROR_MISSING_AUDIO_FILES]: ({ dispatch }) => {
    dispatch(actions.toggleInfo(false))
    dispatch(actions.toggleError(true))
    dispatch(actions.toggleButtonControl(false))
    dispatch(actions.toggleProgressBar(false))
    dispatch(actions.toggleChapterControls(false))
    dispatch(actions.toggleSteppersControls(false))
  }
})
