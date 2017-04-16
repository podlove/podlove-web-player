const INITIAL = {
  open: false,
  customStart: false,
  dimensions: '250x400',
  customStarttime: 0
}

const share = (state = INITIAL, action) => {
  switch (action.type) {
    case 'TOGGLE_SHARE':
      return Object.assign({}, state, {open: !state.open})
    case 'TOGGLE_SHARE_CUSTOMSTART':
      return Object.assign({}, state, {customStart: !state.customStart})
    case 'SET_EMBED_DIMENSIONS':
      return Object.assign({}, state, {dimensions: action.payload})
    case 'SET_SHARE_CUSTOMSTARTTIME':
      return Object.assign({}, state, {customStarttime: action.payload})
    default:
      return state
  }
}

export {
  share
}
