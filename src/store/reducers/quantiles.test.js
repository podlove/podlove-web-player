import test from 'ava'
import { quantiles } from './quantiles'

// QUANTILES TESTS
test(`quantiles: is a reducer function`, t => {
  t.is(typeof quantiles, 'function')
})

test(`quantiles: it loads all quantiles`, t => {
  const testAction = {
    type: 'LOAD_QUANTILES',
    payload: [[0, 20]]
  }

  t.deepEqual(quantiles([], testAction), [[0, 20]])
})

test(`quantiles: it adds a new quantile if currently not exists`, t => {
  const testAction = {
    type: 'SET_QUANTILE',
    payload: {
      start: 0,
      end: 50
    }
  }

  t.deepEqual(quantiles([], testAction), [[0, 50]])
})

test(`quantiles: it updates an existing quantile if it's exists`, t => {
  const testAction = {
    type: 'SET_QUANTILE',
    payload: {
      start: 0,
      end: 60
    }
  }

  t.deepEqual(quantiles([[0, 20]], testAction), [[0, 60]])
})

test(`quantiles: it returns the state if not a matching action is called`, t => {
  const testAction = {
    type: 'INVALID_ACTION'
  }

  t.deepEqual(quantiles([[0, 20]], testAction), [[0, 20]])
})
