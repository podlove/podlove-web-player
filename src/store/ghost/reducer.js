import { handleActions } from 'redux-actions'
import { toInt } from 'utils/helper'

import { SIMULATE_PLAYTIME, ENABLE_GHOST_MODE, DISABLE_GHOST_MODE } from '../types'

export const INITIAL_STATE = {
  time: 0,
  active: false
}

export const reducer = handleActions({
  [SIMULATE_PLAYTIME]: (state, { payload }) => ({
    ...state,
    time: toInt(payload)
  }),

  [ENABLE_GHOST_MODE]: (state) => ({
    ...state,
    active: true
  }),

  [DISABLE_GHOST_MODE]: (state) => ({
    ...state,
    active: false
  })
}, INITIAL_STATE)
