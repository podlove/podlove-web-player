import { createAction } from 'redux-actions'

import { TOGGLE_TAB, SET_TABS } from '../types'

export const toggleTab = createAction(TOGGLE_TAB)
export const setTabs = createAction(SET_TABS)
