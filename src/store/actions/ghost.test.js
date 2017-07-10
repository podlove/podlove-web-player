import test from 'ava'
import { simulatePlaytime, enableGhostMode, disableGhostMode } from './ghost'

test(`simulatePlaytime: creates the SIMULATE_PLAYTIME action`, t => {
  t.deepEqual(simulatePlaytime(100), {
    type: 'SIMULATE_PLAYTIME',
    payload: 100
  })
})

test(`enableGhostMode: creates the ENABLE_GHOST_MODE action`, t => {
  t.deepEqual(enableGhostMode(), {
    type: 'ENABLE_GHOST_MODE'
  })
})

test(`disableGhostMode: creates the DISABLE_GHOST_MODE action`, t => {
  t.deepEqual(disableGhostMode(), {
    type: 'DISABLE_GHOST_MODE'
  })
})
