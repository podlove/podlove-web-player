import test from 'ava'
import {
  toggleInfo,
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

  toggleChaptersTab,
  toggleShareTab,
  toggleAudioTab
} from './components'

const toggleActions = [{
  name: 'toggleInfoAction',
  type: 'TOGGLE_COMPONENT_INFO',
  method: toggleInfo
}, {
  name: 'toggleErrorAction',
  type: 'TOGGLE_COMPONENT_ERROR',
  method: toggleError
}, {
  name: 'toggleProgressBarAction',
  type: 'TOGGLE_COMPONENT_PROGRESSBAR',
  method: toggleProgressBar
}, {
  name: 'toggleChapterControlsAction',
  method: toggleChapterControls,
  type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS'
}, {
  name: 'toggleSteppersControlsAction',
  method: toggleSteppersControls,
  type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS'
}, {
  name: 'toggleButtonControlAction',
  method: toggleButtonControl,
  type: 'TOGGLE_COMPONENT_CONTROLS_BUTTON'
}, {
  name: 'toggleChaptersTabAction',
  method: toggleChaptersTab,
  type: 'TOGGLE_COMPONENT_TABS_CHAPTERS'
}, {
  name: 'toggleShareTabAction',
  method: toggleShareTab,
  type: 'TOGGLE_COMPONENT_TABS_SHARE'
}, {
  name: 'toggleSettingsTabAction',
  method: toggleAudioTab,
  type: 'TOGGLE_COMPONENT_TABS_AUDIO'
}]

const voidActions = [{
  name: 'showLoadingButtonAction',
  method: showLoadingButton,
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_LOADING'
}, {
  name: 'showPauseButtonAction',
  method: showPauseButton,
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
}, {
  name: 'showReplayButtonAction',
  method: showReplayButton,
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY'
}, {
  name: 'showRemainingButtonAction',
  method: showRemainingButton,
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING'
}, {
  name: 'showDurationButtonAction',
  method: showDurationButton,
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_DURATION'
}, {
  name: 'showRetryButtonAction',
  method: showRetryButton,
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_RETRY'
}, {
  name: 'showPlayingButtonAction',
  method: showPlayingButton,
  type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING'
}]

toggleActions.forEach(action => {
  test(`${action.name}: creates the ${action.type} action`, t => {
    t.is(typeof action.method, 'function')

    t.deepEqual(action.method(false), {
      type: action.type,
      payload: false
    })

    t.deepEqual(action.method(true), {
      type: action.type,
      payload: true
    })
  })
})

voidActions.forEach(action => {
  test(`${action.name}: creates the ${action.type} action`, t => {
    t.deepEqual(action.method(), {
      type: action.type
    })
  })
})
