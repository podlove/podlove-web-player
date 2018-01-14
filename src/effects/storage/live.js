import { get, noop } from 'lodash'
import { hashCode } from 'hashcode'

import { handleActions } from 'utils/effects'

import actions from 'store/actions'
import { INIT, SET_VOLUME, TOGGLE_TAB } from 'store/types'

let storage = {
  get: noop,
  set: noop
}

const metaHash = config =>
  hashCode().value({
    ...config,
    playtime: 0
  })

export default storageFactory => handleActions({
  [INIT]: ({ dispatch }, { payload }) => {
    storage = storageFactory(metaHash(payload))

    const storedTabs = storage.get('tabs')
    const storedVolume = storage.get('volume')

    if (storedTabs) {
      dispatch(actions.setTabs(storedTabs))
    }

    if (storedVolume) {
      dispatch(actions.setVolume(storedVolume))
    }
  },

  [SET_VOLUME]: (store, action, state) => {
    const volume = get(state, 'volume', 1)
    storage.set('volume', volume)
  },

  [TOGGLE_TAB]: (store, action, state) => {
    const tabs = get(state, 'tabs', {})
    storage.set('tabs', tabs)
  }
})
