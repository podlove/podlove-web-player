import { get, noop } from 'lodash'
import { hashCode } from 'hashcode'

import { handleActions } from 'utils/effects'

import actions from 'store/actions'
import { INIT, SET_PLAYTIME, UPDATE_PLAYTIME, TOGGLE_TAB, SET_QUANTILE, SET_VOLUME, SET_RATE, SET_FILTER_MONO, SET_FILTER_STEREO } from 'store/types'

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
    const storedChannel = storage.get('channel')
    const storedQuantiles = storage.get('quantiles')
    const playtime = get(state, 'playtime', 0)

    if (playtime === 0 && storedPlaytime) {
      dispatch(actions.updatePlaytime(storedPlaytime))
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

    if (storedChannel === 'mono') {
      dispatch(actions.setMonoChannel())
    }

    if (storedChannel === 'stereo') {
      dispatch(actions.setStereoChannel())
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
  },

  [SET_FILTER_MONO]: () => {
    storage.set('channels', 'mono')
  },

  [SET_FILTER_STEREO]: () => {
    storage.set('channel', 'stereo')
  }
})
