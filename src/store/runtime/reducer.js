import { handleActions } from 'redux-actions'

import { SET_RUNTIME, SET_LANGUAGE } from '../types'

export const INITIAL_STATE = {}

export const reducer = handleActions({
  [SET_RUNTIME]: (state, { payload }) => ({
    ...state,
    ...payload
  }),
  [SET_LANGUAGE]: (state, { payload }) => ({
    ...state,
    language: payload
  })
}, INITIAL_STATE)
