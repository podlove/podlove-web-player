export default (state = 0, action) => {
  switch (action.type) {
    case 'SET_PLAYTIME':
      return action.payload
    default:
      return state
  }
}
