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

const running = (state = false, action) => {
  switch (action.type) {
    case 'PLAY':
      return true
    case 'UI_PLAY':
      return true
    case 'PAUSE':
      return false
    case 'UI_PAUSE':
      return false
    default:
      return state
  }
}

export {
  playtime,
  duration,
  buffer,
  running
}
