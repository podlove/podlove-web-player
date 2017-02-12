const INITIAL = {
  open: false,
  width: 250,
  height: 440
}

const share = (state = INITIAL, action) => {
  switch (action.type) {
    case 'TOGGLE_SHARE':
      return Object.assign({}, state, {
        open: !state.open
      })
    case 'SET_EMBED_DIMENSIONS':
      return Object.assign({}, state, action.payload)
    default:
      return state
  }
}

export {
  share
}
