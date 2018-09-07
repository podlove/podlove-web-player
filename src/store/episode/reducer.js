import { get } from 'lodash'
import { handleActions } from 'redux-actions'

import { parseDate } from 'utils/time'
import { sanitize } from 'utils/dom'

import { INIT } from '../types'

export const INIT_STATE = {
  title: null,
  subtitle: null,
  summary: null,
  poster: null,
  link: null,
  publicationDate: null
}

export const reducer = handleActions({
  [INIT]: (state, { payload }) => ({
    ...state,
    title: get(payload, ['title'], null),
    subtitle: get(payload, ['subtitle'], null),
    summary: sanitize(get(payload, ['summary'], null)),
    link: get(payload, ['link'], null),
    poster: get(payload, ['poster'], null),
    publicationDate: parseDate(get(payload, ['publicationDate'], null))
  })
}, INIT_STATE)
