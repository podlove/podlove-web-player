import { get } from 'lodash'
import { handleActions } from 'redux-actions'

import { toPlayerTime } from 'utils/time'
import { toInt } from 'utils/helper'

import { INIT, SET_DURATION } from '../types'

export const INITIAL_STATE = 0

export const reducer = handleActions({
  [INIT]: (state, { payload }) => toPlayerTime(get(payload, 'duration', state)),
  [SET_DURATION]: (state, { payload }) => toInt(payload || state)
}, INITIAL_STATE)
