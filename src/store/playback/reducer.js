import { handleActions } from 'redux-actions'

import { SET_URL_PARAMS } from '../types'

export const INITIAL_STATE = {
  starttime: null,
  endtime: null,
  autoplay: false
}

export const reducer = handleActions({
  [SET_URL_PARAMS]: (state, { payload }) => payload
}, INITIAL_STATE)
