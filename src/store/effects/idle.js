import actions from '../actions'

export default (store, action) => {
  switch (action.type) {
    case 'INIT':
      if (action.payload.playtime > 0) {
        store.dispatch(actions.idle())
      }
      break
  }
}
