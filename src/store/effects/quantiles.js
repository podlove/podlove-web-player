import actions from '../actions'

let startTime = null

export default (store, action) => {
  switch (action.type) {
    case 'SET_PLAYTIME':
        if (!startTime) {
            startTime = action.payload
        }

        store.dispatch(actions.setQuantile(startTime, action.payload))
      break
    case 'UPDATE_PLAYTIME':
        startTime = null
      break
  }
}
