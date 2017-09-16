import test from 'ava'
import {
  setDuration,
  setBuffer,
  play,
  playEvent,
  pause,
  pauseEvent,
  endEvent,
  restart,
  idle,
  toggleTimerMode,
  loading,
  setVolume,
  setRate,
  mute,
  unmute,
  load,
  loaded
} from './player'

test(`setDurationAction: creates the SET_DURATION action`, t => {
  t.deepEqual(setDuration(10), {
    type: 'SET_DURATION',
    payload: 10
  })
})

test(`setBufferAction: creates the SET_BUFFER action`, t => {
  t.deepEqual(setBuffer(10), {
    type: 'SET_BUFFER',
    payload: 10
  })
})

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

test(`toggleTimerModeAction: creates the TOGGLE_TIMERMODE action`, t => {
  t.deepEqual(toggleTimerMode(), {
    type: 'TOGGLE_TIMERMODE'
  })
})

test(`loadingAction: creates the LOADING action`, t => {
  t.deepEqual(loading('foo'), {
    type: 'LOADING',
    payload: 'foo'
  })
})

test(`volumeAction: creates the SET_VOLUME action`, t => {
  t.deepEqual(setVolume(0.2), {
    type: 'SET_VOLUME',
    payload: 0.2
  })
})

test(`rateAction: creates the SET_RATE action`, t => {
  t.deepEqual(setRate(1), {
    type: 'SET_RATE',
    payload: 1
  })
})

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

test(`loadAction: creates the LOAD action`, t => {
  t.deepEqual(load(), {
    type: 'LOAD'
  })
})

test(`loadedAction: creates the LOAD action`, t => {
  t.deepEqual(loaded('foo'), {
    type: 'LOADED',
    payload: 'foo'
  })
})
