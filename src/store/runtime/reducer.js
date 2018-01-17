import { handleActions } from 'redux-actions'

import { INIT, SET_LANGUAGE } from '../types'

export const INITIAL_STATE = {}

export const reducer = handleActions({
  [INIT]: (state, { payload }) => ({
    ...state,
    ...payload.runtime
  }),
  [SET_LANGUAGE]: (state, { payload }) => ({
    ...state,
    language: payload
  })
}, INITIAL_STATE)
