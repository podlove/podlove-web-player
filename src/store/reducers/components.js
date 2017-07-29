const INITIAL = {
  info: true,
  error: false,
  controls: {
    button: {
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
    },
    chapters: false,
    steppers: false
  },
  progressbar: false,
  tabs: {
    chapters: false,
    share: false,
    audio: true,
    download: false
  }
}

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

const components = (state = INITIAL, action) => {
  switch (action.type) {
    case 'TOGGLE_COMPONENT_INFO':
      return {
        ...state,
        info: action.payload
      }
    case 'TOGGLE_COMPONENT_ERROR':
      return {
        ...state,
        error: action.payload
      }
    case 'TOGGLE_COMPONENT_PROGRESSBAR':
      return {
        ...state,
        progressbar: action.payload
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
    case 'TOGGLE_COMPONENT_CONTROLS_BUTTON':
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
      return {
        ...state,
        tabs: {
          ...state.tabs,
          chapters: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_TABS_SHARE':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          share: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_TABS_AUDIO':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          audio: action.payload
        }
      }
    case 'TOGGLE_COMPONENT_TABS_DOWNLOAD':
      return {
        ...state,
        tabs: {
          ...state.tabs,
          download: action.payload
        }
      }
    default:
      return state
  }
}

export {
  components
}
