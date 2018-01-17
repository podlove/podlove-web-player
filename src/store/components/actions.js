import { createAction } from 'redux-actions'

import {
  TOGGLE_COMPONENT_INFO,
  TOGGLE_COMPONENT_ERROR,
  TOGGLE_COMPONENT_PROGRESSBAR,
  TOGGLE_COMPONENT_INFO_POSTER,
  TOGGLE_COMPONENT_CONTROLS_CHAPTERS,
  TOGGLE_COMPONENT_CONTROLS_STEPPERS,
  TOGGLE_COMPONENT_CONTROLS_BUTTON,
  SHOW_COMPONENT_CONTROLS_BUTTON_LOADING,
  SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY,
  SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING,
  SHOW_COMPONENT_CONTROLS_BUTTON_DURATION,
  SHOW_COMPONENT_CONTROLS_BUTTON_RETRY,
  SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING,
  SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE,
  TOGGLE_COMPONENT_TAB,
  TOGGLE_COMPONENT_VOLUME_SLIDER,
  TOGGLE_COMPONENT_RATE_SLIDER
} from '../types'

export const toggleInfo = createAction(TOGGLE_COMPONENT_INFO)
export const toggleError = createAction(TOGGLE_COMPONENT_ERROR)
export const toggleProgressBar = createAction(TOGGLE_COMPONENT_PROGRESSBAR)
export const toggleInfoPoster = createAction(TOGGLE_COMPONENT_INFO_POSTER)
export const toggleChapterControls = createAction(TOGGLE_COMPONENT_CONTROLS_CHAPTERS)
export const toggleSteppersControls = createAction(TOGGLE_COMPONENT_CONTROLS_STEPPERS)
export const toggleButtonControl = createAction(TOGGLE_COMPONENT_CONTROLS_BUTTON)
export const showLoadingButton = createAction(SHOW_COMPONENT_CONTROLS_BUTTON_LOADING)
export const showReplayButton = createAction(SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY)
export const showRemainingButton = createAction(SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING)
export const showDurationButton = createAction(SHOW_COMPONENT_CONTROLS_BUTTON_DURATION)
export const showRetryButton = createAction(SHOW_COMPONENT_CONTROLS_BUTTON_RETRY)
export const showPlayingButton = createAction(SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING)
export const showPauseButton = createAction(SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE)
export const toggleComponentTab = createAction(TOGGLE_COMPONENT_TAB, (tab, visibility) => ({ tab, visibility }))
export const toggleVolumeSlider = createAction(TOGGLE_COMPONENT_VOLUME_SLIDER)
export const toggleRateSlider = createAction(TOGGLE_COMPONENT_RATE_SLIDER)
