import { get } from 'lodash'
import { handleActions } from 'redux-actions'

import { INIT, SET_DOWNLOAD_FILE } from '../types'

export const INITIAL_STATE = {
  selected: null,
  files: []
}

export const reducer = handleActions({
  [INIT]: (state, { payload }) => ({
    ...state,
    selected: get(payload, ['audio', 0, 'url'], null),
    files: get(payload, 'audio', [])
  }),

  [SET_DOWNLOAD_FILE]: (state, { payload }) => ({
    ...state,
    selected: payload
  })
}, INITIAL_STATE)
