import actions from '../actions'
import get from 'lodash/get'
import { hashCode } from 'hashcode'
import { tabs } from '../reducers/tabs'

let podloveStorage

const metaHash = config =>
  hashCode().value(Object.assign({}, config, {playtime: 0}))

export default storage => (store, action) => {
  switch (action.type) {
    case 'INIT':
      podloveStorage = storage(metaHash(action.payload))

      const storedPlaytime = podloveStorage.get('playtime')
      const storedTabs = podloveStorage.get('tabs')

      if (storedPlaytime) {
        store.dispatch(actions.setPlaytime(storedPlaytime))
        store.dispatch(actions.idle())
      }

      if (storedTabs) {
        store.dispatch(actions.setTabs(storedTabs))
      }
      break
    case 'SET_PLAYTIME':
    case 'UPDATE_PLAYTIME':
      if (!podloveStorage) {
        return
      }

      podloveStorage.set('playtime', action.payload)
      break
    case 'TOGGLE_TAB':
      const currentState = get(store.getState(), 'tabs', {})
      podloveStorage.set('tabs', currentState)
      break
  }
}
