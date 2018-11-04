import { get, isArray, noop } from 'lodash'

import actions from 'store/actions'
import {
  INIT,
  LOADING,
  LOADED,
  PLAY,
  PAUSE,
  IDLE,
  END,
  NETWORK_EMPTY,
  NETWORK_NO_SOURCE,
  ERROR_MISSING_AUDIO_FILES,
  INIT_CHAPTERS,
  SET_TRANSCRIPTS_TIMELINE
} from 'store/types'

import { selectChapters, selectAudioFiles } from 'store/selectors'

import { handleActions } from 'utils/effects'

const hasChapters = chapters => isArray(chapters) && chapters.length > 0
const hasMeta = (show, episode) =>
  episode.poster ||
  show.poster ||
  show.title ||
  episode.title ||
  episode.subtitle
const hasFiles = files => files && files.length > 0
const hasAudioFiles = files => files && files.length > 0

const networkError = ({ dispatch }) => {
  dispatch(actions.toggleInfo(false))
  dispatch(actions.toggleError(true))
  dispatch(actions.showRetryButton())
  dispatch(actions.toggleProgressBar(false))
  dispatch(actions.toggleChapterControls(false))
  dispatch(actions.toggleSteppersControls(false))
}

export default handleActions({
  [INIT]: ({ dispatch }, { payload }, state) => {
    const files = get(payload, 'audio', [])
    const audioFiles = selectAudioFiles(state)
    const episode = get(state, 'episode', {})
    const show = get(state, 'show', {})
    const runtime = get(state, 'runtime', {})

    if (hasFiles(files)) {
      dispatch(actions.toggleComponentTab('files', true))
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
    dispatch(actions.toggleChannelsSelection(true))
    dispatch(actions.toggleInfoPoster(true))

    // Reset Errors
    dispatch(actions.toggleError(false))

    if (!hasAudioFiles(audioFiles)) {
      dispatch(actions.errorMissingAudioFiles())
    }
  },

  [INIT_CHAPTERS]: ({ dispatch }, { payload }, state) => {
    if (!hasChapters(payload)) {
      return
    }

    dispatch(actions.toggleComponentTab('chapters', true))

    if (state.playstate !== 'start') {
      dispatch(actions.toggleChapterControls(true))
    }
  },

  [LOADING]: ({ dispatch }) => dispatch(actions.showLoadingButton()),

  [LOADED]: ({ dispatch }, { payload }) =>
    (payload.paused
      ? dispatch(actions.showPauseButton())
      : dispatch(actions.showPlayingButton())),

  [PLAY]: ({ dispatch }, _, state) => {
    // Default behaviour
    dispatch(actions.showPlayingButton())
    dispatch(actions.toggleProgressBar(true))
    hasChapters(selectChapters(state)) ? dispatch(actions.toggleChapterControls(true)) : noop()
    dispatch(actions.toggleSteppersControls(true))

    // Error Fallbacks
    dispatch(actions.toggleInfo(true))
    dispatch(actions.toggleError(false))
  },

  [PAUSE]: ({ dispatch }) => dispatch(actions.showPauseButton()),

  [IDLE]: ({ dispatch }, _, state) => {
    dispatch(actions.showPauseButton())
    hasChapters(selectChapters(state)) ? dispatch(actions.toggleChapterControls(true)) : noop()
    dispatch(actions.toggleSteppersControls(true))
    dispatch(actions.toggleProgressBar(true))
  },

  [SET_TRANSCRIPTS_TIMELINE]: ({ dispatch }, { payload }) => {
    if (payload.length > 0) {
      dispatch(actions.toggleComponentTab('transcripts', true))
    }
  },

  [END]: ({ dispatch }) => dispatch(actions.showReplayButton()),

  [NETWORK_EMPTY]: networkError,
  [NETWORK_NO_SOURCE]: networkError,

  [ERROR_MISSING_AUDIO_FILES]: ({ dispatch }) => {
    dispatch(actions.toggleInfo(false))
    dispatch(actions.toggleError(true))
    dispatch(actions.toggleButtonControl(false))
    dispatch(actions.showDurationButton())
    dispatch(actions.toggleProgressBar(false))
    dispatch(actions.toggleChapterControls(false))
    dispatch(actions.toggleSteppersControls(false))
  }
})
