import { handleActions } from 'redux-actions'

import { MUTE, UNMUTE } from '../types'

export const INITIAL_STATE = false

export const reducer = handleActions({
  [MUTE]: () => true,
  [UNMUTE]: () => false
}, INITIAL_STATE)
