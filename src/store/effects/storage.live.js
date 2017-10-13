import actions from '../actions'
import get from 'lodash/get'
import { hashCode } from 'hashcode'

let podloveStorage

const metaHash = config =>
  hashCode().value(Object.assign({}, config, {playtime: 0}))

export default (storage, store, action) => {
  switch (action.type) {
    case 'INIT':
      podloveStorage = storage(metaHash(action.payload))

      const storedTabs = podloveStorage.get('tabs')
      const storedVolume = podloveStorage.get('volume')

      if (storedTabs) {
        store.dispatch(actions.setTabs(storedTabs))
      }

      if (storedVolume) {
        store.dispatch(actions.setVolume(storedVolume))
      }
      break
    case 'SET_VOLUME':
      const currentVolume = get(store.getState(), 'volume', 1)
      podloveStorage.set('volume', currentVolume)
      break
    case 'TOGGLE_TAB':
      const tabs = get(store.getState(), 'tabs', {})
      podloveStorage.set('tabs', tabs)
      break
  }
}
