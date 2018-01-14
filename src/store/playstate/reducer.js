import { get } from 'lodash'
import { handleActions } from 'redux-actions'

import { INIT, UPDATE_PLAYTIME, PLAY, PAUSE, STOP, IDLE, LOADING, ERROR_LOAD } from '../types'

export const INITIAL_STATE = 'start'

export const reducer = handleActions({
  [INIT]: (state, { payload }) => get(payload, 'playstate', state),
  [UPDATE_PLAYTIME]: (state) => state === 'end' ? 'pause' : state,
  [PLAY]: () => 'playing',
  [PAUSE]: () => 'pause',
  [STOP]: () => 'end',
  [IDLE]: () => 'idle',
  [LOADING]: () => 'loading',
  [ERROR_LOAD]: () => 'error'
}, INITIAL_STATE)
