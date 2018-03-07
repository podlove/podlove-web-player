import test from 'ava'
import { reducer as playstate } from './reducer'

// PLAYSTATE TESTS
test(`playstate: is a reducer function`, t => {
  t.is(typeof playstate, 'function')
})

test(`playstate: parses the playstate on INIT`, t => {
  let result = playstate(undefined, {
    type: 'INIT',
    payload: {
      playstate: 'CUSTOM'
    }
  })

  t.is(result, 'CUSTOM')

  result = playstate('CUSTOM', {
    type: 'INIT',
    payload: {}
  })

  t.is(result, 'CUSTOM')
})

test(`playstate: parses the playstate on UPDATE_PLAYTIME`, t => {
  let result = playstate('end', {
    type: 'UPDATE_PLAYTIME'
  })

  t.is(result, 'pause')

  result = playstate('CUSTOM', {
    type: 'UPDATE_PLAYTIME'
  })

  t.is(result, 'CUSTOM')
})

const playstates = {
  PLAY: 'playing',
  PAUSE: 'pause',
  STOP: 'end',
  IDLE: 'idle',
  LOADING: 'loading',
  'ERROR_LOAD': 'error'
}

Object.keys(playstates).forEach(state => {
  test(`playstate: parses the playstate on ${state}`, t => {
    let result = playstate(undefined, {
      type: state
    })

    t.is(result, playstates[state])
  })
})

test(`playstate: it does nothing if a unknown action is dispatched`, t => {
  const result = playstate('CUSTOM', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'CUSTOM')
})
