import { get, isUndefined } from 'lodash'

const INITIAL_HEADER = {
  info: false,
  error: false
}

const INITIAL_BUTTON = {
  visible: true,
  variant: {
    loading: false,
    replay: false,
    duration: true,
    remaining: false,
    retry: false,
    playing: false,
    pause: false
  }
}

const INITIAL_PROGRESSBAR = {
  visible: false
}

const INITIAL_TABS = {
  chapters: {
    visible: false
  },
  share: {
    visible: false
  },
  audio: {
    visible: false,
    volume: false,
    rate: false
  },
  download: {
    visible: false
  },
  info: {
    visible: false
  }
}

const componentsState = (state) => ({
  header: get(state, 'header', INITIAL_HEADER),
  controls: {
    button: get(state, 'controls.button', INITIAL_BUTTON),
    chapters: get(state, 'controls.chapters', false),
    steppers: get(state, 'controls.steppers', false)
  },
  progressbar: get(state, 'progressbar', INITIAL_PROGRESSBAR),
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
        ...state.controls.button,
        variant: {
          ...defaultVariants,
          [variant]: active
        }
      }
    }
  }
}

const setTabsVisibility = (state, tab, visible) => {
  if (isUndefined(state.tabs[tab])) {
    return state
  }

  return {
    ...state,
    tabs: {
      ...state.tabs,
      [tab]: {
        ...state.tabs[tab],
        visible
      }
    }
  }
}

const components = (state = componentsState(), action) => {
  switch (action.type) {
    case 'INIT':
      return componentsState(get(action.payload, 'components', {}))
    case 'TOGGLE_COMPONENT_INFO':
      if (isUndefined(state.header.info)) {
        return state
      }

      return {
        ...state,
        header: {
          ...state.header,
          info: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_ERROR':
      if (isUndefined(state.header.error)) {
        return state
      }

      return {
        ...state,
        header: {
          ...state.header,
          error: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_PROGRESSBAR':
      if (isUndefined(state.progressbar.visible)) {
        return state
      }

      return {
        ...state,
        progressbar: {
          ...state.progressbar,
          visible: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS':
      if (isUndefined(state.controls.chapters)) {
        return state
      }

      return {
        ...state,
        controls: {
          ...state.controls,
          chapters: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_CONTROLS_STEPPERS':
      if (isUndefined(state.controls.steppers)) {
        return state
      }

      return {
        ...state,
        controls: {
          ...state.controls,
          steppers: action.payload
        }
      }

    // Central Play Button
    case 'TOGGLE_COMPONENT_CONTROLS_BUTTON':
      if (isUndefined(state.controls.button)) {
        return state
      }

      return {
        ...state,
        controls: {
          ...state.controls,
          button: {
            ...state.controls.button,
            visible: action.payload
          }
        }
      }
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

    // Tabs
    case 'TOGGLE_COMPONENT_TABS_CHAPTERS':
      return setTabsVisibility(state, 'chapters', action.payload)
    case 'TOGGLE_COMPONENT_TABS_SHARE':
      return setTabsVisibility(state, 'share', action.payload)
    case 'TOGGLE_COMPONENT_TABS_AUDIO':
      return setTabsVisibility(state, 'audio', action.payload)
    case 'TOGGLE_COMPONENT_TABS_DOWNLOAD':
      return setTabsVisibility(state, 'download', action.payload)
    case 'TOGGLE_COMPONENT_TABS_INFO':
      return setTabsVisibility(state, 'info', action.payload)

    // Audio Modifiers
    case 'TOGGLE_COMPONENT_VOLUME_SLIDER':
      if (isUndefined(state.tabs.audio)) {
        return state
      }

      return {
        ...state,
        tabs: {
          ...state.tabs,
          audio: {
            ...state.tabs.audio,
            volume: action.payload
          }
        }
      }
    case 'TOGGLE_COMPONENT_RATE_SLIDER':
      if (isUndefined(state.tabs.audio)) {
        return state
      }

      return {
        ...state,
        tabs: {
          ...state.tabs,
          audio: {
            ...state.tabs.audio,
            rate: action.payload
          }
        }
      }
    default:
      return state
  }
}

export {
  components
}
