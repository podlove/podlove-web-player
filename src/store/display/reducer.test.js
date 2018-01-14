import test from 'ava'
import { reducer as display } from './reducer'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {}
  }
})

// display TESTS
test(`display: it is a reducer function`, t => {
  t.is(typeof display, 'function')
})

test(`display: it extracts the display`, t => {
  testAction.payload.display = 'embed'
  const result = display('', testAction)
  t.is(result, 'embed')
})

test(`display: it returns native if a display is not available`, t => {
  let result = display(undefined, testAction)
  t.is(result, 'native')
})

test(`display: it does nothing if not the init action is dispatched`, t => {
  const result = display('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
