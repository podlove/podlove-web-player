import actions from 'store/actions'
import { SET_URL_PARAMS } from 'store/types'

import { handleActions } from 'utils/effects'

export default handleActions({
  [SET_URL_PARAMS]: ({ dispatch }, { payload }) => {
    if (payload.starttime) {
      dispatch(actions.setPlaytime(payload.starttime))
      dispatch(actions.idle())
    }

    if (payload.autoplay) {
      dispatch(actions.play())
    }
  }
})
