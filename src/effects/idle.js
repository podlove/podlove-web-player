import store from 'store'

let idle = null
const IDLE_TIMEOUT = 10 * 60 * 1000

export default action => {
  switch (action.type) {
    case 'PLAY':
      clearTimeout(idle)
      break
    case 'PAUSE':
      idle = setTimeout(() => {
        store.dispatch(store.actions.idle())
      }, IDLE_TIMEOUT)
      break
  }
}
