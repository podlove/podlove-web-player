import { handleActions } from 'redux-actions'
import { get } from 'lodash'

import { INIT } from '../types'

export const INITIAL_STATE = 'native'

export const reducer = handleActions({
  [INIT]: (state, { payload }) => get(payload, 'display', INITIAL_STATE)
}, INITIAL_STATE)
