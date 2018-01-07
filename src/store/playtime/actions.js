import { createAction } from 'redux-actions'

import { SET_PLAYTIME, UPDATE_PLAYTIME } from '../types'

export const setPlaytime = createAction(SET_PLAYTIME)
export const updatePlaytime = createAction(UPDATE_PLAYTIME)
