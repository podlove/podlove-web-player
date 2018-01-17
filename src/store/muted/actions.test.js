import test from 'ava'
import { mute, unmute } from './actions'

test(`muteAction: creates the MUTE action`, t => {
  t.deepEqual(mute(), {
    type: 'MUTE'
  })
})

test(`unmuteAction: creates the UNMUTE action`, t => {
  t.deepEqual(unmute(), {
    type: 'UNMUTE'
  })
})
