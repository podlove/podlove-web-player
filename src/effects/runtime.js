import { get } from 'lodash'

import { INIT } from 'store/types'
import actions from 'store/actions'
import runtime from 'utils/runtime'

import { handleActions } from 'utils/effects'

export default handleActions({
  [INIT]: ({ dispatch }, { payload }) => {
    const config = get(payload, 'runtime', {})

    dispatch(actions.setRuntime({
      ...runtime,
      ...config
    }))
  }
})
