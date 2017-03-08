import actions from '../actions'

import storage from 'utils/storage'
import hash from 'short-hash'

let podloveStorage

export default (store, action) => {
  switch (action.type) {
    case 'INIT':
      if (!action.payload.title) {
        return
      }

      podloveStorage = storage(hash(action.payload.title))

      let storedPlaytime = podloveStorage.get('playtime')

      if (storedPlaytime !== undefined) {
        store.dispatch(actions.setPlaytime(storedPlaytime))
        store.dispatch(actions.idle())
      }
      break
    case 'SET_PLAYTIME':
      if (!podloveStorage) {
        return
      }

      podloveStorage.set('playtime', action.payload)
      break
  }
}
