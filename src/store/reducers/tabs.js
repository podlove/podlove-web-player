const get = require('lodash/get')

const INITIAL = {
  chapters: false,
  audio: false,
  share: false,
  download: false,
  info: false
}

const tabs = (state = INITIAL, action) => {
  let tabs

  switch (action.type) {
    case 'INIT':
      tabs = get(action.payload, 'tabs', null)

      return {
        ...INITIAL,
        ...tabs
      }

    case 'TOGGLE_TAB':
      return {
        ...INITIAL,
        [action.payload]: !get(state, action.payload, false)
      }

    case 'SET_TABS':
      return action.payload
    default:
      return state
  }
}

export {
  tabs
}
