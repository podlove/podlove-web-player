import { get } from 'lodash'

const display = (state = 'native', action) => {
  switch (action.type) {
    case 'INIT':
      return action.payload.display || state
    default:
      return state
  }
}

const mode = (state = 'episode', action) => {
  switch (action.type) {
    case 'INIT':
      if (action.payload.mode === 'live') {
        return 'live'
      } else {
        return 'episode'
      }
    default:
      return state
  }
}

const reference = (state = {}, action) => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        config: get(action.payload, ['reference', 'config'], null),
        share: get(action.payload, ['reference', 'share'], null),
        origin: get(action.payload, ['reference', 'origin'], null)
      }
    default:
      return state
  }
}

export {
  reference,
  display,
  mode
}
