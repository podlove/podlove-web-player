import test from 'ava'
import sinon from 'sinon'

import volumeEffects from './volume'

let store

test.beforeEach(t => {
  store = {
    dispatch: sinon.stub(),
    getState: () => {}
  }
})

test(`volumeEffects: it dispatches MUTE on SET_VOLUME if volume equals 0`, t => {
  volumeEffects(store, {
    type: 'SET_VOLUME',
    payload: 0
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'MUTE'
  })
})

test(`volumeEffects: it dispatches UNMUTE on SET_VOLUME if volume is greate than 0`, t => {
  volumeEffects(store, {
    type: 'SET_VOLUME',
    payload: 0.2
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UNMUTE'
  })
})
