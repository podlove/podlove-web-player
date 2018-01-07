import actions from 'store/actions'
import { SET_URL_PARAMS } from 'store/types'

import { handleActions } from 'utils/effects'

export default handleActions({
  [SET_URL_PARAMS]: ({ dispatch }, { payload }) => {
    if (payload.playtime) {
      dispatch(actions.setPlaytime(payload.playtime))
      dispatch(actions.idle())
    }

    if (payload.autoplay) {
      dispatch(actions.play())
    }
  }
})
