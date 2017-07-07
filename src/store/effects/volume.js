import actions from '../actions'

export default (store, action) => {
  switch (action.type) {
    case 'SET_VOLUME':
      if (action.payload <= 0) {
        store.dispatch(actions.mute())
      } else {
        store.dispatch(actions.unmute())
      }
      break
  }
}
