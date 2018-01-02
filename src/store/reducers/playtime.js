import { get } from 'lodash'
import { secondsToMilliseconds, toPlayerTime } from 'utils/time'
import { toInt } from 'utils/helper'

const playtime = (state = 0, action) => {
  switch (action.type) {
    case 'INIT':
      const playtime = state > 0 ? state : get(action.payload, 'playtime', state)
      return toPlayerTime(playtime)
    case 'UPDATE_PLAYTIME':
      return toInt(action.payload)
    case 'SET_PLAYTIME':
      return toInt(action.payload)
    default:
      return state
  }
}

export {
  playtime
}
