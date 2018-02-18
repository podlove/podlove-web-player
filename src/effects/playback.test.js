import test from 'ava'
import sinon from 'sinon'

import urlEffects from './playback'

let store

test.beforeEach(t => {
  store = {
    dispatch: sinon.stub(),
    getState: () => {}
  }
})

test(`playbackEffects: it dispatches autoplay on SET_URL_PARAMS`, t => {
  urlEffects(store, {
    type: 'SET_URL_PARAMS',
    payload: {
      autoplay: true
    }
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UI_PLAY'
  })
})

test(`playbackEffects: it dispatches starttime on SET_URL_PARAMS`, t => {
  urlEffects(store, {
    type: 'SET_URL_PARAMS',
    payload: {
      starttime: 10
    }
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_PLAYTIME',
    payload: 10
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'IDLE'
  })
})
