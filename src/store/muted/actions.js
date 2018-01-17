import { createAction } from 'redux-actions'

import { MUTE, UNMUTE } from '../types'

export const mute = createAction(MUTE)
export const unmute = createAction(UNMUTE)
