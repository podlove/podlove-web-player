import test from 'ava'
import sinon from 'sinon'

import keyboardEffectFactory from './keyboard'

let keyEventHandler
let store

const effect = register => {
  const fakeHandler = (key, onKey, offKey) => {
    if (key === register) {
      onKey && onKey()
      offKey && offKey()
    }
  }

  keyEventHandler = sinon.spy(fakeHandler)

  return keyboardEffectFactory(keyEventHandler)
}

test.beforeEach(t => {
  store = {
    dispatch: sinon.stub(),
    getState: () => ({
      playtime: 10,
      duration: 200
    })
  }
})

test(`keyboardEffect: it exports a effect factory`, t => {
  t.is(typeof effect(), 'function')
})

test(`keyboardEffect: it registers playtime modifiers`, t => {
  effect()(store)
  t.is(keyEventHandler.getCall(0).args[0], 'right')
  t.is(keyEventHandler.getCall(1).args[0], 'left')
})

test(`keyboardEffect: it registers play/pause modifiers`, t => {
  effect()(store)
  t.is(keyEventHandler.getCall(2).args[0], 'space')
})

test(`keyboardEffect: it registers chapter modifiers`, t => {
  effect()(store)
  t.is(keyEventHandler.getCall(3).args[0], 'alt+right')
  t.is(keyEventHandler.getCall(4).args[0], 'alt+left')
})

test(`keyboardEffect: scrub forward dispatches UPDATE_PLAYTIME`, t => {
  effect('right')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.truthy(action.payload > 10)
})

test(`keyboardEffect: scrub forward does not dispatch a playtime greater than duration UPDATE_PLAYTIME`, t => {
  store = {
    dispatch: sinon.stub(),
    getState: () => ({
      playtime: 200,
      duration: 200
    })
  }
  effect('right')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.truthy(action.payload <= 200)
})

test(`keyboardEffect: scrub backward dispatches UPDATE_PLAYTIME`, t => {
  effect('left')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.truthy(action.payload < 10)
})

test(`keyboardEffect: scrub backward does not dispatch a negative UPDATE_PLAYTIME`, t => {
  store = {
    dispatch: sinon.stub(),
    getState: () => ({
      playtime: 0,
      duration: 200
    })
  }
  effect('left')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.truthy(action.payload >= 0)
})

test(`keyboardEffect: playPause dispatches UI_PLAY`, t => {
  effect('space')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UI_PLAY')
})

test(`keyboardEffect: playPause dispatches UI_PAUSE`, t => {
  store.getState = () => ({
    playstate: 'playing'
  })

  effect('space')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UI_PAUSE')
})

test(`keyboardEffect: next chapter dispatches UPDATE_PLAYTIME`, t => {
  store.getState = () => ({
    playtime: 10,
    duration: 2000,
    chapters: [{
      start: 0,
      active: true
    }, {
      start: 20
    }]
  })

  effect('alt+right')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.is(action.payload, 20)
})

test(`keyboardEffect: previous chapter dispatches UPDATE_PLAYTIME`, t => {
  store.getState = () => ({
    playtime: 10,
    duration: 2000,
    chapters: [{
      start: 0
    }, {
      active: true,
      start: 20
    }]
  })

  effect('alt+left')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.is(action.payload, 0)
})

test(`keyboardEffect: previous chapter dispatches duration as a fallback for UPDATE_PLAYTIME`, t => {
  store.getState = () => ({
    playtime: 10,
    duration: 2000
  })

  effect('alt+right')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.is(action.payload, 2000)
})


test(`keyboardEffect: previous chapter dispatches 0 as a fallback for UPDATE_PLAYTIME`, t => {
  store.getState = () => ({
    playtime: 10,
    duration: 2000
  })

  effect('alt+left')(store)
  const action = store.dispatch.firstCall.args[0]
  t.is(action.type, 'UPDATE_PLAYTIME')
  t.is(action.payload, 0)
})

