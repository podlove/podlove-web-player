import test from 'ava'
import { setBuffer } from './actions'

test(`setBufferAction: creates the SET_BUFFER action`, t => {
  t.deepEqual(setBuffer(10), {
    type: 'SET_BUFFER',
    payload: 10
  })
})
