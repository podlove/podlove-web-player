import test from 'ava'
import { components } from './components'

let uiState, compareState

test.beforeEach(() => {
  uiState = {
    header: {
      info: false,
      error: false
    },
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
    progressbar: {
      visible: false
    },
    tabs: {
      chapters: {
        visible: false
      },
      share: {
        visible: false
      },
      audio: {
        visible: false,
        rate: false,
        volume: false
      },
      download: {
        visible: false
      },
      info: {
        visible: false
      }
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

test(`info: it doesn't toggles the info component if undfined`, t => {
  uiState.header.info = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: false
  })

  compareState.header.info = undefined

  t.deepEqual(result, compareState)
})

test(`info: it toggles the info component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: false
  })

  compareState.header.info = false

  t.deepEqual(result, compareState)
})

test(`error: it toggles the error component if undefined`, t => {
  uiState.header.error = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_ERROR',
    payload: false
  })

  compareState.header.error = undefined

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

test(`progressbar: it doesn't toggles the progressbar component if undefined`, t => {
  uiState.progressbar = {}

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: true
  })

  compareState.progressbar = {}

  t.deepEqual(result, compareState)
})

test(`progressbar: it toggles the progressbar component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: true
  })

  compareState.progressbar.visible = true

  t.deepEqual(result, compareState)
})

test(`control chapters: it doesn't toggles the chapters control component if undefined`, t => {
  uiState.controls.chapters = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: true
  })

  compareState.controls.chapters = undefined

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

test(`control steppers: it doesn't toggles the steppers control component if undefined`, t => {
  uiState.controls.steppers = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    payload: true
  })

  compareState.controls.steppers = undefined

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

test(`control button visibility: it doesn't toggles the button control component if undefined`, t => {
  uiState.controls.button = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_CONTROLS_BUTTON',
    payload: true
  })

  compareState.controls.button = undefined

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

test(`tabs: it doesn't controls the chapters tabs component if undefined`, t => {
  uiState.tabs.chapters = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_CHAPTERS',
    payload: true
  })

  compareState.tabs.chapters = undefined

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the chapters tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_CHAPTERS',
    payload: true
  })

  compareState.tabs.chapters.visible = true

  t.deepEqual(result, compareState)
})

test(`tabs: it doesn't controls the share tabs component if undefined`, t => {
  uiState.tabs.share = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_SHARE',
    payload: true
  })

  compareState.tabs.share = undefined

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the share tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_SHARE',
    payload: true
  })

  compareState.tabs.share.visible = true

  t.deepEqual(result, compareState)
})

test(`tabs: it doesn't controls the audio tabs component if undefined`, t => {
  uiState.tabs.audio = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_AUDIO',
    payload: true
  })

  compareState.tabs.audio = undefined

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the audio tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_AUDIO',
    payload: true
  })

  compareState.tabs.audio.visible = true

  t.deepEqual(result, compareState)
})

test(`tabs: it doesn't controls the download tabs component if undefined`, t => {
  uiState.tabs.download = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_DOWNLOAD',
    payload: true
  })

  compareState.tabs.download = undefined

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the download tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_DOWNLOAD',
    payload: true
  })

  compareState.tabs.download.visible = true

  t.deepEqual(result, compareState)
})

test(`tabs: it doesn't controls the info tabs component if undefined`, t => {
  uiState.tabs.info = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_INFO',
    payload: true
  })

  compareState.tabs.info = undefined

  t.deepEqual(result, compareState)
})

test(`tabs: it controls the info tabs component`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_TABS_INFO',
    payload: true
  })

  compareState.tabs.info.visible = true

  t.deepEqual(result, compareState)
})

test(`volumeSlider: it doesn't toggle the volume slider if undefined`, t => {
  uiState.tabs.audio = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_VOLUME_SLIDER',
    payload: true
  })

  compareState.tabs.audio = undefined

  t.deepEqual(result, compareState)
})

test(`volumeSlider: it toggle the volume slider`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_VOLUME_SLIDER',
    payload: true
  })

  compareState.tabs.audio.volume = true

  t.deepEqual(result, compareState)
})
test(`rateSlider: it doesn't toggle the rate slider if undefined`, t => {
  uiState.tabs.audio = undefined

  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_RATE_SLIDER',
    payload: true
  })

  compareState.tabs.audio = undefined

  t.deepEqual(result, compareState)
})

test(`rateSlider: it toggle the rate slider`, t => {
  const result = components(uiState, {
    type: 'TOGGLE_COMPONENT_RATE_SLIDER',
    payload: true
  })

  compareState.tabs.audio.rate = true

  t.deepEqual(result, compareState)
})
