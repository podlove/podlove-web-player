import { createAction } from 'redux-actions'

import { SET_LANGUAGE, SET_RUNTIME } from '../types'

export const setLanguage = createAction(SET_LANGUAGE)
export const setRuntime = createAction(SET_RUNTIME)
