import actions from 'store/actions'
import { SET_PLAYBACK_PARAMS, SET_PLAYTIME } from 'store/types'

import { handleActions } from 'utils/effects'

let paused = false

export default handleActions({
  [SET_PLAYBACK_PARAMS]: ({ dispatch }, { payload }) => {
    if (payload.starttime) {
      dispatch(actions.setPlaytime(payload.starttime))
      dispatch(actions.idle())
    }

    if (payload.autoplay) {
      dispatch(actions.play())
    }
  },

  [SET_PLAYTIME]: ({ dispatch }, { payload }, state) => {
    if (!state.playback.stoptime) {
      return
    }

    if (state.playback.stoptime <= payload && paused === false) {
      dispatch(actions.pause())
      paused = true
    }
  }
})
