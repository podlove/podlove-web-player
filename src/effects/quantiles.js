import actions from 'store/actions'
import { SET_PLAYTIME, NEXT_CHAPTER, PREVIOUS_CHAPTER, UPDATE_PLAYTIME } from 'store/types'

import { handleActions } from 'utils/effects'

let startTime = null

const resetStarttime = () => {
  startTime = null
}

export default handleActions({
  [SET_PLAYTIME]: ({ dispatch }, { payload }) => {
    if (!startTime) {
      startTime = payload
    }

    dispatch(actions.setQuantile(startTime, payload))
  },

  [NEXT_CHAPTER]: resetStarttime,
  [PREVIOUS_CHAPTER]: resetStarttime,
  [UPDATE_PLAYTIME]: resetStarttime
})
