import test from 'ava'
import { components, visibleComponents } from './components'

let uiState, compareState

test.beforeEach(() => {
  uiState = {
    header: {
      info: false,
      error: false,
      poster: false
    },
    controls: {
      button: {
        loading: false,
        replay: false,
        duration: true,
        remaining: false,
        retry: false,
        playing: false,
        pause: false
      },
      chapters: false,
      steppers: false
    },
    progressbar: false,
    tabs: {
      chapters: false,
      share: false,
      audio: false,
      info: false,
      download: false
    },
    audio: {
      rateControl: false,
      volumeControl: false
    }
  }

  compareState = Object.assign({}, uiState)
})

test(`it exports a reducer function`, t => {
  t.truthy(typeof components === 'function')
})

test(`it ignores not registered actions`, t => {
  const result = components(undefined, {
    type: 'NOT_A_REAL_ACTION'
  })

  t.deepEqual(result, uiState)
})

test(`init: it creates the initial state`, t => {
  const result = components(undefined, {
    type: 'INIT'
  })

  t.deepEqual(result, uiState)
})

test(`info: it toggles the info component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: false
  })

  compareState.header.info = false

  t.deepEqual(result, compareState)
})

test(`error: it toggles the error component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_ERROR',
    payload: false
  })

  compareState.header.error = false

  t.deepEqual(result, compareState)
})

test(`progressbar: it toggles the progressbar component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: true
  })

  compareState.progressbar = true

  t.deepEqual(result, compareState)
})

test(`control chapters: it toggles the chapters control component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: true
  })

  compareState.controls.chapters = true

  t.deepEqual(result, compareState)
})

test(`control steppers: it toggles the steppers control component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    payload: true
  })

  compareState.controls.steppers = true

  t.deepEqual(result, compareState)
})

test(`control button visibility: it toggles the button control component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_CONTROLS_BUTTON',
    payload: true
  })

  compareState.controls.button = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component loading state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_LOADING'
  })

  compareState.controls.button.loading = true
  compareState.controls.button.duration = false

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component replay state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY'
  })

  compareState.controls.button.duration = false
  compareState.controls.button.replay = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component remaining state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING'
  })

  compareState.controls.button.duration = false
  compareState.controls.button.remaining = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component duration state`, t => {
  uiState.controls.button.duration = false

  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_DURATION'
  })

  compareState.controls.button.duration = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component retry state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_RETRY'
  })

  compareState.controls.button.duration = false
  compareState.controls.button.retry = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component playing state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING'
  })

  compareState.controls.button.duration = false
  compareState.controls.button.playing = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component pause state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
  })

  compareState.controls.button.duration = false
  compareState.controls.button.pause = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the chapters tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'chapters',
      visibility: true
    }
  })

  compareState.tabs.chapters = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the share tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'share',
      visibility: true
    }
  })

  compareState.tabs.share = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the audio tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      visibility: true,
      tab: 'audio'
    }
  })

  compareState.tabs.audio = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the download tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'download',
      visibility: true
    }
  })

  compareState.tabs.download = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the info tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'info',
      visibility: true
    }
  })
  compareState.tabs.info = true

  t.deepEqual(result, compareState)
})

test(`volumeSlider: it toggle the volume slider`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_VOLUME_SLIDER',
    payload: true
  })

  compareState.audio.volumeControl = true

  t.deepEqual(result, compareState)
})

test(`rateSlider: it toggle the rate slider`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_RATE_SLIDER',
    payload: true
  })

  compareState.audio.rateControl = true

  t.deepEqual(result, compareState)
})

test(`visibleComponents: it loads the visibleComponents on INIT`, t => {
  const result = visibleComponents(undefined, {
    type: 'INIT',
    payload: {
      visibleComponents: ['tabInfo', 'tabChapters']
    }
  })

  t.deepEqual(result, {
    tabInfo: true,
    tabChapters: true
  })
})

test(`visibleComponents: it loads all visibleComponents on default`, t => {
  const result = visibleComponents(undefined, {
    type: 'FOOBAR'
  })

  t.deepEqual(result, {
    tabInfo: true,
    tabChapters: true,
    tabDownload: true,
    tabAudio: true,
    tabShare: true,
    progressbar: true,
    controlSteppers: true,
    controlChapters: true,
    episodeTitle: true,
    poster: true,
    showTitle: true,
    subtitle: true
  })
})
