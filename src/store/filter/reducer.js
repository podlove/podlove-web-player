import { get } from 'lodash'
import { handleActions } from 'redux-actions'

import { LOADING, UPDATE_FILTER } from '../types'

export const INITIAL_STATE = {
  channels: 2
}

const stateHandler = (state, { payload }) => ({
  ...state,
  channels: get(payload, 'channels', 2)
})

export const reducer = handleActions({
  [LOADING]: stateHandler,
  [UPDATE_FILTER]: stateHandler
}, INITIAL_STATE)
