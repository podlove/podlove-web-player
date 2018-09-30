import { get } from 'lodash'
import { handleActions } from 'redux-actions'
import { sanitize } from 'utils/dom'

import { INIT } from '../types'

export const INITIAL_STATE = {
  title: null,
  subtitle: null,
  summary: null,
  poster: null,
  link: null
}

export const reducer = handleActions({
  [INIT]: (state, { payload }) => ({
    ...state,
    title: get(payload, ['show', 'title'], null),
    subtitle: get(payload, ['show', 'subtitle'], null),
    summary: sanitize(get(payload, ['show', 'summary'], null)),
    link: get(payload, ['show', 'link'], null),
    poster: get(payload, ['show', 'poster'], null)
  })
}, INITIAL_STATE)
