import actions from '../actions'

export default (store, { type, payload }) => {
  switch (type) {
    case 'SET_URL_PARAMS':
      if (payload.playtime) {
        store.dispatch(actions.setPlaytime(payload.playtime))
        store.dispatch(actions.idle())
      }

      if (payload.autoplay) {
        store.dispatch(actions.play())
      }
      break
  }
}
