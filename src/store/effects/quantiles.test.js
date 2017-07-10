import test from 'ava'
import sinon from 'sinon'

import quantiles from './quantiles'

let store

test.beforeEach(t => {
  store = {
    dispatch: sinon.stub()
  }
})

test(`quantilesEffect: it exports a function`, t => {
  t.is(typeof quantiles, 'function')
})

test(`quantilesEffect: it dispatches SET_QUANTILE on SET_PLAYTIME`, t => {
  const testAction = {
    type: 'SET_PLAYTIME',
    payload: 1
  }

  quantiles(store, testAction)
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_QUANTILE',
    payload: {
      start: 1,
      end: 1
    }
  })
})

test(`quantilesEffect: it tracks if a quantile is started`, t => {
  quantiles(store, {
    type: 'SET_PLAYTIME',
    payload: 1
  })

  quantiles(store, {
    type: 'SET_PLAYTIME',
    payload: 100
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'SET_QUANTILE',
    payload: {
      start: 1,
      end: 100
    }
  })
})

test(`quantileEffect: it resets the start time if UPDATE_PLAYTIME is triggered`, t => {
  quantiles(store, {
    type: 'SET_PLAYTIME',
    payload: 1
  })

  quantiles(store, {
    type: 'SET_PLAYTIME',
    payload: 100
  })

  quantiles(store, {
    type: 'UPDATE_PLAYTIME',
    payload: 1000
  })

  quantiles(store, {
    type: 'NEXT_CHAPTER',
    payload: 1000
  })

  quantiles(store, {
    type: 'PREVIOUS_CHAPTER',
    payload: 1000
  })

  quantiles(store, {
    type: 'SET_PLAYTIME',
    payload: 1000
  })

  t.deepEqual(store.dispatch.getCall(2).args[0], {
    type: 'SET_QUANTILE',
    payload: {
      start: 1000,
      end: 1000
    }
  })
})
