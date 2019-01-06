import { createAction } from 'redux-actions'

import { IDLE, PLAY, PAUSE, END, STOP, UI_PLAY, UI_PAUSE, UI_RESTART } from '../types'

export const idle = createAction(IDLE)
export const playEvent = createAction(PLAY)
export const pauseEvent = createAction(PAUSE)
export const endEvent = createAction(END)
export const play = createAction(UI_PLAY)
export const pause = createAction(UI_PAUSE)
export const restart = createAction(UI_RESTART)
export const stop = createAction(STOP)
