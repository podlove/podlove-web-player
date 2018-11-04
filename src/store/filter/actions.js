import { createAction } from 'redux-actions'

import { UPDATE_FILTER, SET_FILTER_MONO, SET_FILTER_STEREO } from '../types'

export const updateFilter = createAction(UPDATE_FILTER)
export const setMonoChannel = createAction(SET_FILTER_MONO)
export const setStereoChannel = createAction(SET_FILTER_STEREO)
