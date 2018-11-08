import { handleActions } from 'redux-actions'
import { get } from 'lodash'

import { INIT, TOGGLE_TAB, SET_TABS } from '../types'

export const INITIAL_STATE = {
  chapters: false,
  audio: false,
  share: false,
  files: false,
  info: false,
  transcripts: false
}

export const reducer = handleActions({
  [INIT]: (state, { payload }) => ({
    ...INITIAL_STATE,
    ...get(payload, 'tabs', null)
  }),

  [TOGGLE_TAB]: (state, { payload }) => ({
    ...INITIAL_STATE,
    [payload]: !get(state, payload, false)
  }),

  [SET_TABS]: (state, { payload }) => payload
}, INITIAL_STATE)
