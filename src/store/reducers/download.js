import { get } from 'lodash'

const INITIAL_STATE = {
  selected: null,
  files: []
}

const download = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        selected: get(action.payload, ['audio', 0, 'url'], null),
        files: get(action.payload, 'audio', [])
      }
    case 'SET_DOWNLOAD_FILE':
      return {
        ...state,
        selected: action.payload
      }
    default:
      return state
  }
}

export {
  download
}
