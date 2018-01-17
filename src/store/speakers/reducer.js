import { handleActions } from 'redux-actions'
import { get } from 'lodash'

import { INIT } from '../types'

export const INITIAL_STATE = []

export const reducer = handleActions({
  [INIT]: (state, { payload }) =>
    get(payload, 'contributors', [])
      .filter(contributor => get(contributor, 'group.slug') === 'onair')
}, INITIAL_STATE)
