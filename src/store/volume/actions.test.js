import test from 'ava'

import { setVolume } from './actions'

test(`volumeAction: creates the SET_VOLUME action`, t => {
  t.deepEqual(setVolume(0.2), {
    type: 'SET_VOLUME',
    payload: 0.2
  })
})
