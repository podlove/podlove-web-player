import test from 'ava'
import { components } from './components'

let uiState, compareState

test.beforeEach(() => {
  uiState = {
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

test(`info: it toggles the info component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: false
  })

  compareState.info = false

  t.deepEqual(result, compareState)
})

test(`error: it toggles the error component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_ERROR',
    payload: false
  })

  compareState.error = false

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

  compareState.controls.button.visible = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component loading state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_LOADING'
  })

  compareState.controls.button.variant.loading = true
  compareState.controls.button.variant.duration = false

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component replay state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY'
  })

  compareState.controls.button.variant.duration = false
  compareState.controls.button.variant.replay = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component remaining state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REMAINING'
  })

  compareState.controls.button.variant.duration = false
  compareState.controls.button.variant.remaining = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component duration state`, t => {
  uiState.controls.button.variant.duration = false

  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_DURATION'
  })

  compareState.controls.button.variant.duration = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component retry state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_RETRY'
  })

  compareState.controls.button.variant.duration = false
  compareState.controls.button.variant.retry = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component playing state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING'
  })

  compareState.controls.button.variant.duration = false
  compareState.controls.button.variant.playing = true

  t.deepEqual(result, compareState)
})

test(`play button: it controls the play button component pause state`, t => {
  const result = components(uiState, {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
  })

  compareState.controls.button.variant.duration = false
  compareState.controls.button.variant.pause = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the chapters tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_CHAPTERS',
    payload: true
  })

  compareState.tabs.chapters = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the share tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_SHARE',
    payload: true
  })

  compareState.tabs.share = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the audio tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_AUDIO',
    payload: true
  })

  compareState.tabs.audio = true

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the download tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_DOWNLOAD',
    payload: true
  })

  compareState.tabs.download = true

  t.deepEqual(result, compareState)
})
