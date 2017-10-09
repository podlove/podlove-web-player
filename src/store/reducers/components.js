import { get } from 'lodash'

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
  chapters: false
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

const components = (state = componentsState(), action) => {
  switch (action.type) {
    case 'TOGGLE_COMPONENT_INFO':
      return {
        ...state,
        header: {
          ...state.header,
          info: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_INFO_POSTER':
      return {
        ...state,
        header: {
          ...state.header,
          poster: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_ERROR':
      return {
        ...state,
        header: {
          ...state.header,
          error: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS':
      return {
        ...state,
        controls: {
          ...state.controls,
          chapters: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_CONTROLS_STEPPERS':
      return {
        ...state,
        controls: {
          ...state.controls,
          steppers: action.payload
        }
      }

    // Central Play Button
    case 'SHOW_COMPONENT_CONTROLS_BUTTON_LOADING':
      return buttonVariant(state, 'loading', true)
    case 'SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY':
      return buttonVariant(state, 'replay', true)
    case 'SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING':
      return buttonVariant(state, 'remaining', true)
    case 'SHOW_COMPONENT_CONTROLS_BUTTON_DURATION':
      return buttonVariant(state, 'duration', true)
    case 'SHOW_COMPONENT_CONTROLS_BUTTON_RETRY':
      return buttonVariant(state, 'retry', true)
    case 'SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING':
      return buttonVariant(state, 'playing', true)
    case 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE':
      return buttonVariant(state, 'pause', true)

    // Tab Modifiers
    case 'TOGGLE_COMPONENT_TAB':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [action.payload.tab]: action.payload.visibility
        }
      }

    // Audio Modifiers
    case 'TOGGLE_COMPONENT_VOLUME_SLIDER':
      return {
        ...state,
        audio: {
          ...state.audio,
          volumeControl: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_RATE_SLIDER':
      return {
        ...state,
        audio: {
          ...state.audio,
          rateControl: action.payload
        }
      }

      // Progressbar
    case 'TOGGLE_COMPONENT_PROGRESSBAR':
      return {
        ...state,
        progressbar: action.payload
      }

    default:
      return state
  }
}

const INITIAL_VISIBLE_COMPONENTS = [
  'tabInfo',
  'tabChapters',
  'tabDownload',
  'tabAudio',
  'tabShare',
  'poster',
  'showTitle',
  'episodeTitle',
  'subtitle',
  'progressbar',
  'controlSteppers',
  'controlChapters'
]

const toVisibleComponentState = (components) =>
  components.reduce((result, component) => ({
    ...result,
    [component]: true
  }), {})

const visibleComponents = (state = toVisibleComponentState(INITIAL_VISIBLE_COMPONENTS), action) => {
  switch (action.type) {
    case 'INIT':
      return toVisibleComponentState(get(action.payload, 'visibleComponents', INITIAL_VISIBLE_COMPONENTS))
    default:
      return state
  }
}

export {
  components,
  visibleComponents
}
