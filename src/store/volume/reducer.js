import { handleActions } from 'redux-actions'
import { compose } from 'lodash/fp'

import { inRange } from 'utils/math'
import { toFloat } from 'utils/helper'

import { SET_VOLUME } from '../types'

export const INITIAL_STATE = 1

const inVolumeRange = compose(inRange(0, INITIAL_STATE), toFloat)

export const reducer = handleActions({
  [SET_VOLUME]: (state, { payload }) => inVolumeRange(payload)
}, INITIAL_STATE)
