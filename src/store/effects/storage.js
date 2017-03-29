import actions from '../actions'

import storage from 'utils/storage'
import { hashCode } from 'hashcode'

let podloveStorage

const metaHash = config =>
  hashCode().value(Object.assign({}, config, {playtime: 0}))

export default (store, action) => {
  switch (action.type) {
    case 'INIT':
      podloveStorage = storage(metaHash(action.payload))

      let storedPlaytime = podloveStorage.get('playtime')
      console.log(storedPlaytime)
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
