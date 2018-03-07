import test from 'ava'
import { reducer as duration } from './reducer'

test(`duration: is a reducer function`, t => {
  t.is(typeof duration, 'function')
})

test(`duration: parses the duration on INIT`, t => {
  let result = duration(undefined, {
    type: 'INIT',
    payload: {
      duration: '01:00'
    }
  })

  t.is(result, 60000)

  result = duration(10, {
    type: 'INIT',
    payload: {}
  })

  t.is(result, 10)
})

test(`duration: parses duration on SET_DURATION`, t => {
  let result = duration(undefined, {
    type: 'SET_DURATION',
    payload: 60
  })

  t.is(result, 60)
})

test(`duration: it does nothing if a unknown action is dispatched`, t => {
  const result = duration(10, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 10)
})
