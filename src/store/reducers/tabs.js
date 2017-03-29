const get = require('lodash/get')

const INITIAL = {
  'chapters': false,
  'settings': false
}

const tabs = (state = INITIAL, action) => {
  switch (action.type) {
    case 'TOGGLE_TAB':
      return Object.assign({}, INITIAL, {
        [action.payload]: !get(state, action.payload, false)
      })

    default:
      return state
  }
}

export {
  tabs
}
