const INITIAL = {
  'open': false
}

const share = (state = INITIAL, action) => {
  switch (action.type) {
    case 'TOGGLE_SHARE':
      return Object.assign({}, INITIAL, {
        open: !state.open
      })

    default:
      return state
  }
}

export {
  share
}
