import test from 'ava'
import { reducer as buffer } from './reducer'

// BUFFER TESTS
test(`buffer: is a reducer function`, t => {
  t.is(typeof buffer, 'function')
})

test(`buffer: parses the buffer on SET_BUFFER`, t => {
  let result = buffer(undefined, {
    type: 'SET_BUFFER',
    payload: 60
  })

  t.is(result, 60)
})

test(`buffer: it does nothing if a unknown action is dispatched`, t => {
  const result = buffer(10, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 10)
})
