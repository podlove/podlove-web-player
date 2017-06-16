import test from 'ava'
import sinon from 'sinon'

import components from './components'

let store

test.beforeEach(t => {
  store = {
    dispatch: sinon.stub(),
    getState: sinon.stub().returns({
      chapters: ['chapter 1', 'chapter 2'],
      reference: {
        config: 'reference-config',
        share: 'reference-share',
        origin: 'reference-origin'
      }
    })
  }
})

test(`componentsEffect: it exports a function`, t => {
  t.is(typeof components, 'function')
})

test(`componentsEffect: it shows correct ui components for LOADING action`, t => {
  const testAction = {
    type: 'LOADING'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_LOADING'
  })
})

test(`componentsEffect: it shows correct ui components for PLAY action`, t => {
  const testAction = {
    type: 'PLAY'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING'
  })
  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(2).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(3).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(4).args[0], {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(5).args[0], {
    type: 'TOGGLE_COMPONENT_ERROR',
    payload: false
  })
})

test(`componentsEffect: it shows correct ui components for PAUSE action`, t => {
  const testAction = {
    type: 'PAUSE'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
  })
})

test(`componentsEffect: it shows correct ui components for IDLE action`, t => {
  const testAction = {
    type: 'PAUSE'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
  })
})

test(`componentsEffect: it shows correct ui components for INIT action`, t => {
  const testAction = {
    type: 'INIT'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_TABS_CHAPTERS',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'TOGGLE_COMPONENT_TABS_SHARE',
    payload: true
  })
})

test(`componentsEffect: it shows correct ui components for STOP action`, t => {
  const testAction = {
    type: 'STOP'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY'
  })
})

test(`componentsEffect: it shows correct ui components for ERROR_LOAD action`, t => {
  const testAction = {
    type: 'ERROR_LOAD'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'TOGGLE_COMPONENT_ERROR',
    payload: true
  })

  t.deepEqual(store.dispatch.getCall(2).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_RETRY'
  })

  t.deepEqual(store.dispatch.getCall(3).args[0], {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(4).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(5).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    payload: false
  })
})

test(`componentsEffect: it shows correct ui components for ERROR_MISSING_AUDIO_FILES action`, t => {
  const testAction = {
    type: 'ERROR_MISSING_AUDIO_FILES'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'TOGGLE_COMPONENT_ERROR',
    payload: true
  })

  t.deepEqual(store.dispatch.getCall(2).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_BUTTON',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(3).args[0], {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(4).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(5).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    payload: false
  })
})
