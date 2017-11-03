import test from 'ava'
import sinon from 'sinon'

import storageEffects from './storage.episode'

let storage, store
let setStub, getStub

test.beforeEach(t => {
  getStub = sinon.stub().returns(42)
  setStub = sinon.stub()

  storage = sinon.stub().returns({
    set: setStub,
    get: getStub
  })

  store = {
    dispatch: sinon.stub(),
    getState: sinon.stub().returns({
      volume: 0.8,
      rate: 0.8,
      playtime: 100,
      quantiles: [
        [0, 20]
      ],
      tabs: {
        chapters: false,
        settings: true
      }
    })
  }
})

test(`storageEffects: it exports a effect factory`, t => {
  t.is(typeof storageEffects, 'function')
})

test(`storageEffects: it sets the playtime on INIT if stored`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  t.truthy(storage.called)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_PLAYTIME',
    payload: 42
  })
  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'IDLE'
  })
})

test(`storageEffects: it sets the tabs on INIT if stored`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  t.truthy(storage.called)
  t.deepEqual(store.dispatch.getCall(2).args[0], {
    type: 'SET_TABS',
    payload: 42
  })
})

test(`storageEffects: it sets the volume on INIT if stored`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  t.truthy(storage.called)
  t.deepEqual(store.dispatch.getCall(3).args[0], {
    type: 'SET_VOLUME',
    payload: 42
  })
})

test(`storageEffects: it sets the rate on INIT if stored`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  t.truthy(storage.called)
  t.deepEqual(store.dispatch.getCall(4).args[0], {
    type: 'SET_RATE',
    payload: 42
  })
})

test(`storageEffects: it sets the quantiles on INIT if stored`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  t.truthy(storage.called)
  t.deepEqual(store.dispatch.getCall(5).args[0], {
    type: 'LOAD_QUANTILES',
    payload: 42
  })
})

test(`storageEffects: it doesn't sets state on INIT if nothing is stored`, t => {
  storage = sinon.stub().returns({
    set: setStub,
    get: sinon.stub().returns(undefined)
  })

  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  t.falsy(store.dispatch.called)
})

test(`storageEffects: it persists the playtime on SET_PLAYTIME`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  storageEffects(storage, store, {
    type: 'SET_PLAYTIME',
    payload: 50
  })

  t.is(setStub.getCall(0).args[0], 'playtime')
  t.is(setStub.getCall(0).args[1], 50)
})

test(`storageEffects: it persists the volumen on SET_VOLUME`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  storageEffects(storage, store, {
    type: 'SET_VOLUME',
    payload: 0.5
  })

  t.is(setStub.getCall(0).args[0], 'volume')
  t.is(setStub.getCall(0).args[1], 0.8)
})

test(`storageEffects: it persists the rate on SET_RATE`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  storageEffects(storage, store, {
    type: 'SET_RATE',
    payload: 1
  })

  t.is(setStub.getCall(0).args[0], 'rate')
  t.is(setStub.getCall(0).args[1], 0.8)
})

test(`storageEffects: it persists the tabs on TOGGLE_TAB`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  storageEffects(storage, store, {
    type: 'TOGGLE_TAB'
  })

  t.is(setStub.getCall(0).args[0], 'tabs')
  t.deepEqual(setStub.getCall(0).args[1], {
    chapters: false,
    settings: true
  })
})

test(`storageEffects: it persists the quantiles on SET_QUANTILE`, t => {
  storageEffects(storage, store, {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })

  storageEffects(storage, store, {
    type: 'SET_QUANTILE',
    payload: {
      start: 0,
      end: 500
    }
  })

  t.is(setStub.getCall(0).args[0], 'quantiles')
  t.deepEqual(setStub.getCall(0).args[1], [
    [0, 20]
  ])
})
