import actions from '../actions'

let idle = null
const IDLE_TIMEOUT = 10 * 60 * 1000

export default (store, action) => {
  switch (action.type) {
    case 'INIT':
      if (action.payload.playtime > 0) {
        store.dispatch(actions.idle())
      }
      break
    case 'PLAY':
      clearTimeout(idle)
      break
    case 'PAUSE':
      idle = setTimeout(() => {
        store.dispatch(actions.idle())
      }, IDLE_TIMEOUT)
      break
  }
}
