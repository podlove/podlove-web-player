import { handleActions } from 'redux-actions'
import { get } from 'lodash'

import { INIT } from '../types'

export const INITIAL_STATE = {}

export const reducer = handleActions({
  [INIT]: (state, { payload }) => ({
    ...state,
    config: get(payload, ['reference', 'config'], null),
    share: get(payload, ['reference', 'share'], null),
    origin: get(payload, ['reference', 'origin'], null)
  })
}, INITIAL_STATE)
