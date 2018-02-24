import test from 'ava'
import sinon from 'sinon'

import urlEffects from './playback'

let store

test.beforeEach(t => {
  store = {
    dispatch: sinon.stub(),
    getState: () => ({})
  }
})

test(`playbackEffects: it dispatches autoplay on SET_PLAYBACK_PARAMS`, t => {
  urlEffects(store, {
    type: 'SET_PLAYBACK_PARAMS',
    payload: {
      autoplay: true
    }
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UI_PLAY'
  })
})

test(`playbackEffects: it dispatches SET_PLAYTIME on SET_PLAYBACK_PARAMS`, t => {
  urlEffects(store, {
    type: 'SET_PLAYBACK_PARAMS',
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

test(`playbackEffects: it dispatches PAUSE on SET_PLAYTIME if stoptime is not defined`, t => {
  store.getState = () => ({
    playback: {
      starttime: 10
    },
    playtime: 15
  })

  urlEffects(store, {
    type: 'SET_PLAYTIME',
    payload: {
      starttime: 10
    }
  })

  t.is(store.dispatch.getCalls().length, 0)
})

test(`playbackEffects: it dispatches PAUSE on SET_PLAYTIME if stoptime is defined`, t => {
  store.getState = () => ({
    playback: {
      starttime: 10,
      stoptime: 15
    }
  })

  urlEffects(store, {
    type: 'SET_PLAYTIME',
    payload: 15
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UI_PAUSE'
  })

  urlEffects(store, {
    type: 'SET_PLAYTIME',
    payload: 120
  })

  t.is(store.dispatch.getCalls().length, 1)
})
