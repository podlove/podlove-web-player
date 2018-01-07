import test from 'ava'

import { reducer as muted } from './reducer'

// MUTED
test(`muted: is a reducer function`, t => {
  t.is(typeof muted, 'function')
})

test(`muted: it does nothing if a unknown action is dispatched`, t => {
  const result = muted('CUSTOM', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'CUSTOM')
})

test(`muted: it returns the correct rate`, t => {
  t.is(muted(undefined, {
    type: 'MUTE'
  }), true)

  t.is(muted(undefined, {
    type: 'UNMUTE'
  }), false)
})
