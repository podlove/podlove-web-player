import actions from '../actions'

import storage from 'utils/storage'
import hash from 'object-hash'

let podloveStorage

export default (store, action) => {
  switch (action.type) {
    case 'INIT':
      podloveStorage = storage(hash(action.payload))

      let storedPlaytime = podloveStorage.get('playtime')

      if (storedPlaytime !== undefined) {
        store.dispatch(actions.setPlaytime(storedPlaytime))
        store.dispatch(actions.idle())
      }
      break
    case 'SET_PLAYTIME':
      podloveStorage.set('playtime', action.payload)
      break
  }
}
