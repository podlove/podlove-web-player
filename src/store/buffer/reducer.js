import { handleActions } from 'redux-actions'

import { SET_BUFFER } from '../types'

export const INITIAL_STATE = 0

export const reducer = handleActions({
  [SET_BUFFER]: (state, { payload }) => payload
}, INITIAL_STATE)
