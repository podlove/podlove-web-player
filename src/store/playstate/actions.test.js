import test from 'ava'

import { play, playEvent, pause, pauseEvent, endEvent, restart, idle } from './actions'

test(`playAction: creates the UI_PLAY action`, t => {
  t.deepEqual(play(), {
    type: 'UI_PLAY'
  })
})

test(`playEventAction: creates the PLAY action`, t => {
  t.deepEqual(playEvent(), {
    type: 'PLAY'
  })
})

test(`pauseAction: creates the UI_PAUSE action`, t => {
  t.deepEqual(pause(), {
    type: 'UI_PAUSE'
  })
})

test(`pauseEventAction: creates the PAUSE action`, t => {
  t.deepEqual(pauseEvent(), {
    type: 'PAUSE'
  })
})

test(`endEvent: creates the STOP action`, t => {
  t.deepEqual(endEvent(), {
    type: 'END'
  })
})

test(`restartAction: creates the RESTART action`, t => {
  t.deepEqual(restart(), {
    type: 'UI_RESTART'
  })
})

test(`idleAction: creates the IDLE action`, t => {
  t.deepEqual(idle(), {
    type: 'IDLE'
  })
})
