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

      const storedPlaytime = podloveStorage.get('playtime')
      const storedTabs = podloveStorage.get('tabs')
      const storedVolume = podloveStorage.get('volume')
      const storedRate = podloveStorage.get('rate')
      const storedQuantiles = podloveStorage.get('quantiles')

      if (storedPlaytime) {
        store.dispatch(actions.setPlaytime(storedPlaytime))
        store.dispatch(actions.idle())
      }

      if (storedTabs) {
        store.dispatch(actions.setTabs(storedTabs))
      }

      if (storedVolume) {
        store.dispatch(actions.setVolume(storedVolume))
      }

      if (storedRate) {
        store.dispatch(actions.setRate(storedRate))
      }

      if (storedQuantiles) {
        store.dispatch(actions.loadQuantiles(storedQuantiles))
      }
      break
    case 'SET_PLAYTIME':
    case 'UPDATE_PLAYTIME':
      podloveStorage && podloveStorage.set('playtime', action.payload)
      break
    case 'TOGGLE_TAB':
      const tabs = get(store.getState(), 'tabs', {})
      podloveStorage && podloveStorage.set('tabs', tabs)
      break
    case 'SET_QUANTILE':
      const quantiles = get(store.getState(), 'quantiles', [])
      podloveStorage && podloveStorage.set('quantiles', quantiles)
      break
    case 'SET_VOLUME':
      const currentVolume = get(store.getState(), 'volume', 1)
      podloveStorage && podloveStorage.set('volume', currentVolume)
      break
    case 'SET_RATE':
      const currentRate = get(store.getState(), 'rate', 1)
      podloveStorage && podloveStorage.set('rate', currentRate)
      break
  }
}
