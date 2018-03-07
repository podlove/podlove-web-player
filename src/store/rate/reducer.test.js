import test from 'ava'
import { reducer as rate } from './reducer'

// RATE
test(`rate: is a reducer function`, t => {
  t.is(typeof rate, 'function')
})

test(`rate: it does nothing if a unknown action is dispatched`, t => {
  const result = rate('CUSTOM', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'CUSTOM')
})

test(`rate: it returns the correct rate`, t => {
  t.is(rate(undefined, {
    type: 'SET_RATE',
    payload: 1
  }), 1)

  t.is(rate(1, {
    type: 'SET_RATE',
    payload: 0.2
  }), 0.5)

  t.is(rate(1, {
    type: 'SET_RATE',
    payload: 5
  }), 4)
})
