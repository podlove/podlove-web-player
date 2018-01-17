import { handleActions } from 'redux-actions'
import { compose } from 'lodash/fp'

import { toFloat } from 'utils/helper'
import { inRange } from 'utils/math'

import { SET_RATE } from '../types'

const inRateRange = compose(inRange(0.5, 4), toFloat)

export const INITIAL_STATE = 1

export const reducer = handleActions({
  [SET_RATE]: (state, { payload }) => inRateRange(payload)
}, INITIAL_STATE)
