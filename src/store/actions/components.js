const toggleInfo = visibility => ({
  type: 'TOGGLE_COMPONENT_INFO',
  payload: visibility
})

const toggleError = visibility => ({
  type: 'TOGGLE_COMPONENT_ERROR',
  payload: visibility
})

const toggleProgressBar = visibility => ({
  type: 'TOGGLE_COMPONENT_PROGRESSBAR',
  payload: visibility
})

const toggleInfoPoster = visibility => ({
  type: 'TOGGLE_COMPONENT_INFO_POSTER',
  payload: visibility
})

// Controls
const toggleChapterControls = visibility => ({
  type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
  payload: visibility
})

const toggleSteppersControls = visibility => ({
  type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
  payload: visibility
})

const toggleButtonControl = visibility => ({
  type: 'TOGGLE_COMPONENT_CONTROLS_BUTTON',
  payload: visibility
})

const showLoadingButton = () => ({
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_LOADING'
})

const showReplayButton = () => ({
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY'
})

const showRemainingButton = () => ({
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING'
})

const showDurationButton = () => ({
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_DURATION'
})

const showRetryButton = () => ({
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_RETRY'
})

const showPlayingButton = () => ({
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING'
})

const showPauseButton = visibility => ({
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
})

// Tabs
const toggleComponentTab = (tab, visibility) => ({
  type: 'TOGGLE_COMPONENT_TAB',
  payload: {
    tab,
    visibility
  }
})

// Audio Controls
const toggleVolumeSlider = visibility => ({
  type: 'TOGGLE_COMPONENT_VOLUME_SLIDER',
  payload: visibility
})

const toggleRateSlider = visibility => ({
  type: 'TOGGLE_COMPONENT_RATE_SLIDER',
  payload: visibility
})

export {
  toggleInfo,
  toggleInfoPoster,
  toggleError,
  toggleProgressBar,

  toggleChapterControls,
  toggleSteppersControls,
  toggleButtonControl,

  showLoadingButton,
  showReplayButton,
  showRemainingButton,
  showDurationButton,
  showRetryButton,
  showPlayingButton,
  showPauseButton,

  toggleComponentTab,

  toggleVolumeSlider,
  toggleRateSlider
}
