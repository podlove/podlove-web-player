export default (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.subtitle
    default:
      return state
  }
}
