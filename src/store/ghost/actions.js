import { createAction } from 'redux-actions'

import { SIMULATE_PLAYTIME, ENABLE_GHOST_MODE, DISABLE_GHOST_MODE } from '../types'

export const simulatePlaytime = createAction(SIMULATE_PLAYTIME)
export const enableGhostMode = createAction(ENABLE_GHOST_MODE)
export const disableGhostMode = createAction(DISABLE_GHOST_MODE)
