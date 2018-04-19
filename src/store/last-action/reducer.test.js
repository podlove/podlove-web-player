import test from 'ava'

import { reducer as lastAction } from './reducer'

test(`lastAction: returns the last action`, t => {
  t.is(lastAction('foo', 'bar'), 'bar')
})

test(`lastAction: returns the last action if state is undefined`, t => {
  t.is(lastAction(undefined, 'bar'), 'bar')
})
