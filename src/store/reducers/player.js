import { timeToSeconds } from 'utils/time'

const playtime = (state = 0, action) => {
  switch (action.type) {
    case 'UPDATE_PLAYTIME':
      return action.payload
    case 'SET_PLAYTIME':
      return action.payload
    default:
      return state
  }
}

const duration = (state = 0, action) => {
  switch (action.type) {
    case 'SET_META':
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
    case 'PLAY':
      return 'playing'
    case 'UI_PLAY':
      return 'playing'
    case 'PAUSE':
      return 'pause'
    case 'UI_PAUSE':
      return 'pause'
    case 'STOP':
      return 'end'
    case 'IDLE':
      return 'idle'
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
