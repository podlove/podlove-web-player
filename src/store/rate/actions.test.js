import test from 'ava'

import { setRate } from './actions'

test(`rateAction: creates the SET_RATE action`, t => {
  t.deepEqual(setRate(1), {
    type: 'SET_RATE',
    payload: 1
  })
})
