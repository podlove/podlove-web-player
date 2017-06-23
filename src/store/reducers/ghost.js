const INITIAL = {
  time: 0,
  active: false
}

const ghost = (state = INITIAL, action) => {
  switch (action.type) {
    case 'SIMULATE_PLAYTIME':
      return {
        ...state,
        time: parseFloat(action.payload)
      }
    case 'ENABLE_GHOST_MODE':
      return {
        ...state,
        active: true
      }
    case 'DISABLE_GHOST_MODE':
      return {
        ...state,
        active: false
      }
    default:
      return state
  }
}

export {
  ghost
}
