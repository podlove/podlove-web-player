import test from 'ava'
import sinon from 'sinon'

import components from './episode'

let store, state

test.beforeEach(t => {
  state = {
    chapters: {
      list: ['chapter 1', 'chapter 2']
    },
    files: {
      audio: [{
        url: 'http://foo.bar'
      }, {
        url: 'http://foo.baz'
      }]
    },
    playstate: 'playing',
    episode: {
      url: 'http://foo.bar/episode',
      poster: './img/src'
    },
    show: {
      url: 'http://foo.bar',
      poster: './img/src'
    },
    reference: {
      config: 'reference-config',
      share: 'reference-share',
      origin: 'reference-origin'
    },
    runtime: {
      platform: 'desktop'
    }
  }

  store = {
    dispatch: sinon.stub(),
    getState: sinon.stub().returns(state)
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

test(`componentsEffect: it shows correct ui components for LOADED action when paused`, t => {
  const testAction = {
    type: 'LOADED',
    payload: {
      paused: true
    }
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
  })
})

test(`componentsEffect: it shows correct ui components for LOADED action when playing`, t => {
  const testAction = {
    type: 'LOADED',
    payload: {
      paused: false
    }
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PLAYING'
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
    type: 'IDLE'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_PAUSE'
  })
  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(2).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(3).args[0], {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: true
  })
})

test(`componentsEffect: it shows correct ui components for INIT action`, t => {
  const testAction = {
    type: 'INIT',
    payload: {
      audio: [{
        url: 'http://foo.bar'
      }]
    }
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'files',
      visibility: true
    }
  })
  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(2).args[0], {
    type: 'TOGGLE_COMPONENT_VOLUME_SLIDER',
    payload: true
  })
  t.deepEqual(store.dispatch.getCall(3).args[0], {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'share',
      visibility: true
    }
  })
  t.deepEqual(store.dispatch.getCall(4).args[0], {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'info',
      visibility: true
    }
  })
  t.deepEqual(store.dispatch.getCall(5).args[0], {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'audio',
      visibility: true
    }
  })
  t.deepEqual(store.dispatch.getCall(6).args[0], {
    type: 'TOGGLE_COMPONENT_RATE_SLIDER',
    payload: true
  })
})

test(`componentsEffect: it shows the chapters tab only when chapters are available on INIT_CHAPTERS`, t => {
  const testAction = {
    type: 'INIT_CHAPTERS',
    payload: ['foo', 'bar']
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'chapters',
      visibility: true
    }
  })
})

test(`componentsEffect: it shows the chapter steppers only when chapters are available and playstate is on start on INIT_CHAPTERS`, t => {
  const testAction = {
    type: 'INIT_CHAPTERS',
    payload: ['foo', 'bar']
  }

  store.playstate = 'start'

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'chapters',
      visibility: true
    }
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: true
  })
})

test(`componentsEffect: it shows the download tab only when audio files are available on INIT`, t => {
  const testAction = {
    type: 'INIT'
  }

  state.download = []
  store.getState = sinon.stub().returns(state)

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_INFO',
    payload: true
  })
})

test(`componentsEffect: it shows the info section only when meta available on INIT`, t => {
  const testAction = {
    type: 'INIT'
  }

  state.show = {}
  state.episode = {}
  store.getState = sinon.stub().returns(state)

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_VOLUME_SLIDER',
    payload: true
  })
})

test(`componentsEffect: it shows correct ui components for END action`, t => {
  const testAction = {
    type: 'END'
  }

  components(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_REPLAY'
  })
})

const types = ['NETWORK_EMPTY', 'NETWORK_NO_SOURCE']

types.forEach(type => {
  test(`componentsEffect: it shows correct ui components for ${type} action`, t => {
    const testAction = { type }

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
    type: 'SHOW_COMPONENT_CONTROLS_BUTTON_DURATION'
  })
  t.deepEqual(store.dispatch.getCall(4).args[0], {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(5).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    payload: false
  })

  t.deepEqual(store.dispatch.getCall(6).args[0], {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    payload: false
  })
})

test(`componentsEffect: it enables transcript tab if SET_TRANSCRIPTS_TIMELINE is dispatched with payload`, t => {
  const testAction = {
    type: 'SET_TRANSCRIPTS_TIMELINE',
    payload: []
  }

  components(store, testAction)

  testAction.payload = [1, 2]

  components(store, testAction)

  t.is(store.dispatch.getCalls().length, 1)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'TOGGLE_COMPONENT_TAB',
    payload: {
      tab: 'transcripts',
      visibility: true
    }
  })
})
