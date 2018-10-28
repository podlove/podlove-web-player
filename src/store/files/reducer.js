import { get } from 'lodash'
import { handleActions } from 'redux-actions'

import { INIT } from '../types'

export const INITIAL_STATE = {
  audio: []
}

export const reducer = handleActions({
  [INIT]: (_, { payload }) => ({
    audio: get(payload, 'audio', [])
  })

}, INITIAL_STATE)
