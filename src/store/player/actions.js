import { createAction } from 'redux-actions'

import { INIT, LOAD, LOADING, LOADED, IDLE, PLAY, PAUSE, END } from '../types'

export const init = createAction(INIT)

export const idle = createAction(IDLE)
export const load = createAction(LOAD)
export const loading = createAction(LOADING)
export const loaded = createAction(LOADED)

export const playEvent = createAction(PLAY)
export const pauseEvent = createAction(PAUSE)
export const endEvent = createAction(END)
