import actions from 'store/actions'
import { SET_VOLUME } from 'store/types'

import { handleActions } from 'utils/effects'

export default handleActions({
  [SET_VOLUME]: ({ dispatch }, { payload }) =>
    payload <= 0 ? dispatch(actions.mute()) : dispatch(actions.unmute())
})
