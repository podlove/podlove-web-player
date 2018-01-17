import { get, noop } from 'lodash'
import { hashCode } from 'hashcode'

import { handleActions } from 'utils/effects'

import actions from 'store/actions'
import { INIT, SET_PLAYTIME, UPDATE_PLAYTIME, TOGGLE_TAB, SET_QUANTILE, SET_VOLUME, SET_RATE } from 'store/types'

let storage = {
  get: noop,
  set: noop
}

const metaHash = config =>
  hashCode().value({
    ...config,
    playtime: 0
  })

const setPlaytime = (store, { payload }) => storage.set('playtime', payload)

export default storageFactory => handleActions({
  [INIT]: ({ dispatch }, { payload }, state) => {
    storage = storageFactory(metaHash(payload))

    const storedPlaytime = storage.get('playtime')
    const storedTabs = storage.get('tabs')
    const storedVolume = storage.get('volume')
    const storedRate = storage.get('rate')
    const storedQuantiles = storage.get('quantiles')

    if (storedPlaytime) {
      dispatch(actions.setPlaytime(storedPlaytime))
      dispatch(actions.idle())
    }

    if (storedTabs) {
      dispatch(actions.setTabs(storedTabs))
    }

    if (storedVolume) {
      dispatch(actions.setVolume(storedVolume))
    }

    if (storedRate) {
      dispatch(actions.setRate(storedRate))
    }

    if (storedQuantiles) {
      dispatch(actions.loadQuantiles(storedQuantiles))
    }
  },

  [SET_PLAYTIME]: setPlaytime,
  [UPDATE_PLAYTIME]: setPlaytime,

  [TOGGLE_TAB]: (store, action, state) => {
    const tabs = get(state, 'tabs', {})
    storage.set('tabs', tabs)
  },

  [SET_QUANTILE]: (store, action, state) => {
    const quantiles = get(state, 'quantiles', [])
    storage.set('quantiles', quantiles)
  },

  [SET_VOLUME]: (store, action, state) => {
    const volume = get(store.getState(), 'volume', 1)
    storage && storage.set('volume', volume)
  },

  [SET_RATE]: (store, action, state) => {
    const rate = get(state, 'rate', 1)
    storage.set('rate', rate)
  }
})
