import { get } from 'lodash'
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

export {
  playtime
}
