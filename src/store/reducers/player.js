import get from 'lodash/get'
import { timeToSeconds } from 'utils/time'

const playtime = (state = 0, action) => {
  switch (action.type) {
    case 'INIT':
      const playtime = get(action.payload, 'playtime', state)
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

export {
  playtime,
  duration,
  buffer,
  playstate,
  timerMode
}
