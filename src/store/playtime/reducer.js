import { handleActions } from 'redux-actions'

import { get } from 'lodash'
import { toPlayerTime } from 'utils/time'
import { toInt } from 'utils/helper'

import { INIT, UPDATE_PLAYTIME, SET_PLAYTIME } from '../types'

export const INITIAL_STATE = 0

export const reducer = handleActions({
  [INIT]: (state, { payload }) => toPlayerTime(get(payload, 'playtime', state)),
  [UPDATE_PLAYTIME]: (state, { payload }) => toInt(payload),
  [SET_PLAYTIME]: (state, { payload }) => toInt(payload)
}, INITIAL_STATE)
