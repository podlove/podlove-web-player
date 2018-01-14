import { createAction } from 'redux-actions'

import { LOAD_QUANTILES, SET_QUANTILE } from '../types'

export const loadQuantiles = createAction(LOAD_QUANTILES, (quantiles = []) => quantiles)
export const setQuantile = createAction(SET_QUANTILE, (start, end) => ({ start, end }))
