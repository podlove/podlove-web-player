import test from 'ava'
import { setDuration } from './actions'

test(`setDurationAction: creates the SET_DURATION action`, t => {
  t.deepEqual(setDuration(10), {
    type: 'SET_DURATION',
    payload: 10
  })
})
