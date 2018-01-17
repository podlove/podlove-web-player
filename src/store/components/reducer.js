import { get } from 'lodash'
import { handleActions } from 'redux-actions'

import {
  TOGGLE_COMPONENT_INFO,
  TOGGLE_COMPONENT_INFO_POSTER,
  TOGGLE_COMPONENT_ERROR,
  TOGGLE_COMPONENT_CONTROLS_CHAPTERS,
  TOGGLE_COMPONENT_CONTROLS_STEPPERS,
  SHOW_COMPONENT_CONTROLS_BUTTON_LOADING,
  SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY,
  SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING,
  SHOW_COMPONENT_CONTROLS_BUTTON_DURATION,
  SHOW_COMPONENT_CONTROLS_BUTTON_RETRY,
  SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING,
  SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE,
  TOGGLE_COMPONENT_TAB,
  TOGGLE_COMPONENT_VOLUME_SLIDER,
  TOGGLE_COMPONENT_RATE_SLIDER,
  TOGGLE_COMPONENT_PROGRESSBAR
} from '../types'

const INITIAL_HEADER = {
  info: false,
  error: false,
  poster: false
}

const INITIAL_BUTTON = {
  loading: false,
  replay: false,
  duration: true,
  remaining: false,
  retry: false,
  playing: false,
  pause: false
}

const INITIAL_AUDIO_CONTROLS = {
  volumeControl: false,
  rateControl: false
}

const INITIAL_TABS = {
  info: false,
  audio: false,
  download: false,
  share: false,
  chapters: false,
  transcripts: false
}

const componentsState = (state) => ({
  header: get(state, 'header', INITIAL_HEADER),
  controls: {
    button: get(state, 'controls.button', INITIAL_BUTTON),
    chapters: get(state, 'controls.chapters', false),
    steppers: get(state, 'controls.steppers', false)
  },
  progressbar: get(state, 'progressbar', false),
  audio: get(state, 'audio', INITIAL_AUDIO_CONTROLS),
  tabs: get(state, 'tabs', INITIAL_TABS)
})

const buttonVariant = (state, variant, active) => {
  const defaultVariants = {
    loading: false,
    replay: false,
    duration: false,
    remaining: false,
    retry: false,
    playing: false,
    pause: false
  }

  return {
    ...state,
    controls: {
      ...state.controls,
      button: {
        ...defaultVariants,
        [variant]: active
      }
    }
  }
}

export const reducer = handleActions({
  [TOGGLE_COMPONENT_INFO]: (state, { payload }) => ({
    ...state,
    header: {
      ...state.header,
      info: payload
    }
  }),

  [TOGGLE_COMPONENT_INFO_POSTER]: (state, { payload }) => ({
    ...state,
    header: {
      ...state.header,
      poster: payload
    }
  }),

  [TOGGLE_COMPONENT_ERROR]: (state, { payload }) => ({
    ...state,
    header: {
      ...state.header,
      error: payload
    }
  }),

  [TOGGLE_COMPONENT_CONTROLS_CHAPTERS]: (state, { payload }) => ({
    ...state,
    controls: {
      ...state.controls,
      chapters: payload
    }
  }),

  [TOGGLE_COMPONENT_CONTROLS_STEPPERS]: (state, { payload }) => ({
    ...state,
    controls: {
      ...state.controls,
      steppers: payload
    }
  }),

  [SHOW_COMPONENT_CONTROLS_BUTTON_LOADING]: (state) => buttonVariant(state, 'loading', true),
  [SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY]: (state) => buttonVariant(state, 'replay', true),
  [SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING]: (state) => buttonVariant(state, 'remaining', true),
  [SHOW_COMPONENT_CONTROLS_BUTTON_DURATION]: (state) => buttonVariant(state, 'duration', true),
  [SHOW_COMPONENT_CONTROLS_BUTTON_RETRY]: (state) => buttonVariant(state, 'retry', true),
  [SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING]: (state) => buttonVariant(state, 'playing', true),
  [SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE]: (state) => buttonVariant(state, 'pause', true),

  [TOGGLE_COMPONENT_TAB]: (state, { payload }) => ({
    ...state,
    tabs: {
      ...state.tabs,
      [payload.tab]: payload.visibility
    }
  }),

  [TOGGLE_COMPONENT_VOLUME_SLIDER]: (state, { payload }) => ({
    ...state,
    audio: {
      ...state.audio,
      volumeControl: payload
    }
  }),

  [TOGGLE_COMPONENT_RATE_SLIDER]: (state, { payload }) => ({
    ...state,
    audio: {
      ...state.audio,
      rateControl: payload
    }
  }),

  [TOGGLE_COMPONENT_PROGRESSBAR]: (state, { payload }) => ({
    ...state,
    progressbar: payload
  })
}, componentsState())
