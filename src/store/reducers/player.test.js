import test from 'ava'
import { duration, buffer, playstate, timerMode, volume, rate, muted } from './player'

// DURATION TESTS
test(`duration: is a reducer function`, t => {
  t.is(typeof duration, 'function')
})

test(`duration: parses the duration on INIT`, t => {
  let result = duration(undefined, {
    type: 'INIT',
    payload: {
      duration: '01:00'
    }
  })

  t.is(result, 60)

  result = duration(10, {
    type: 'INIT',
    payload: {}
  })

  t.is(result, 10)
})

test(`duration: parses duration on SET_DURATION`, t => {
  let result = duration(undefined, {
    type: 'SET_DURATION',
    payload: 60
  })

  t.is(result, 60)
})

test(`duration: it does nothing if a unknown action is dispatched`, t => {
  const result = duration(10, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 10)
})

// BUFFER TESTS
test(`buffer: is a reducer function`, t => {
  t.is(typeof buffer, 'function')
})

test(`buffer: parses the buffer on SET_BUFFER`, t => {
  let result = buffer(undefined, {
    type: 'SET_BUFFER',
    payload: 60
  })

  t.is(result, 60)
})

test(`buffer: it does nothing if a unknown action is dispatched`, t => {
  const result = buffer(10, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 10)
})

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

// TIMERMODE TESTS
test(`timerMode: is a reducer function`, t => {
  t.is(typeof timerMode, 'function')
})

test(`timerMode: it does nothing if a unknown action is dispatched`, t => {
  const result = timerMode('CUSTOM', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'CUSTOM')
})

test(`timerMode: parses the mode on TOGGLE_TIMERMODE`, t => {
  let result = timerMode(undefined, {
    type: 'TOGGLE_TIMERMODE'
  })

  t.is(result, 'duration')

  result = timerMode('remaining', {
    type: 'TOGGLE_TIMERMODE'
  })

  t.is(result, 'duration')

  result = timerMode('duration', {
    type: 'TOGGLE_TIMERMODE'
  })

  t.is(result, 'remaining')
})

// VOLUME
test(`volume: is a reducer function`, t => {
  t.is(typeof volume, 'function')
})

test(`volume: it returns the correct volume`, t => {
  t.is(volume(undefined, {
    type: 'SET_RATE',
    payload: 1
  }), 1)

  t.is(volume(1, {
    type: 'SET_VOLUME',
    payload: -1
  }), 0)

  t.is(volume(1, {
    type: 'SET_VOLUME',
    payload: 2
  }), 1)

  t.is(volume(1, {
    type: 'SET_VOLUME',
    payload: 0.2
  }), 0.2)
})

// RATE
test(`rate: is a reducer function`, t => {
  t.is(typeof rate, 'function')
})

test(`rate: it does nothing if a unknown action is dispatched`, t => {
  const result = rate('CUSTOM', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'CUSTOM')
})

test(`rate: it returns the correct rate`, t => {
  t.is(rate(undefined, {
    type: 'SET_RATE',
    payload: 1
  }), 1)

  t.is(rate(1, {
    type: 'SET_RATE',
    payload: 0.2
  }), 0.5)

  t.is(rate(1, {
    type: 'SET_RATE',
    payload: 5
  }), 4)
})

// MUTED
test(`muted: is a reducer function`, t => {
  t.is(typeof muted, 'function')
})

test(`muted: it does nothing if a unknown action is dispatched`, t => {
  const result = muted('CUSTOM', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'CUSTOM')
})

test(`muted: it returns the correct rate`, t => {
  t.is(muted(undefined, {
    type: 'MUTE'
  }), true)

  t.is(muted(undefined, {
    type: 'UNMUTE'
  }), false)
})
