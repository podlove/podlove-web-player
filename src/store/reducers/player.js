import get from 'lodash/get'
import { timeToSeconds } from 'utils/time'

const playtime = (state = 0, action) => {
  switch (action.type) {
    case 'INIT':
      const playtime = state > 0 ? state : get(action.payload, 'playtime', state)
      return timeToSeconds(playtime)
    case 'UPDATE_PLAYTIME':
      return parseFloat(action.payload)
    case 'SET_PLAYTIME':
      return action.payload
    default:
      return state
  }
}

const duration = (state = 0, action) => {
  switch (action.type) {
    case 'INIT':
      return timeToSeconds(action.payload.duration) || state
    case 'SET_DURATION':
      return action.payload
    default:
      return state
  }
}

const buffer = (state = 0, action) => {
  switch (action.type) {
    case 'SET_BUFFER':
      return action.payload
    default:
      return state
  }
}

const playstate = (state = 'start', action) => {
  switch (action.type) {
    case 'INIT':
      return get(action.payload, 'playstate', state)
    // Enable scrubs in end state
    case 'UPDATE_PLAYTIME':
      return state === 'end' ? 'pause' : state
    case 'PLAY':
      return 'playing'
    case 'PAUSE':
      return 'pause'
    case 'STOP':
      return 'end'
    case 'IDLE':
      return 'idle'
    case 'LOADING':
      return 'loading'
    default:
      return state
  }
}

const timerMode = (state = 'remaining', action) => {
  switch (action.type) {
    case 'TOGGLE_TIMERMODE':
      return state === 'remaining' ? 'duration' : 'remaining'
    default:
      return state
  }
}

const volume = (state = 1, action) => {
  if (action.type !== 'SET_VOLUME') {
    return state
  }

  switch (true) {
    case action.payload < 0:
      return 0
    case action.payload > 1:
      return 1
    default:
      return action.payload
  }
}

const rate = (state = 1, action) => {
  if (action.type !== 'SET_RATE') {
    return state
  }

  const rate = parseFloat(action.payload, 10)

  switch (true) {
    case rate < 0.5:
      return 0.5
    case rate > 4:
      return 4
    default:
      return rate
  }
}

export {
  playtime,
  duration,
  buffer,
  playstate,
  timerMode,
  volume,
  rate
}
