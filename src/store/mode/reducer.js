import { handleActions } from 'redux-actions'

import { INIT } from '../types'

export const INITIAL_STATE = 'episode'

export const reducer = handleActions({
  [INIT]: (state, { payload }) => payload.mode === 'live' ? 'live' : INITIAL_STATE
}, INITIAL_STATE)
