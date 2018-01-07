import test from 'ava'

import { init, idle, load, loading, loaded, playEvent, pauseEvent, endEvent } from './actions'

test(`init: creates the INIT action`, t => {
  t.deepEqual(init({ foo: 'bar' }), {
    type: 'INIT',
    payload: { foo: 'bar' }
  })
})

test(`playEventAction: creates the PLAY action`, t => {
  t.deepEqual(playEvent(), {
    type: 'PLAY'
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

test(`idleAction: creates the IDLE action`, t => {
  t.deepEqual(idle(), {
    type: 'IDLE'
  })
})

test(`loadingAction: creates the LOADING action`, t => {
  t.deepEqual(loading('foo'), {
    type: 'LOADING',
    payload: 'foo'
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
