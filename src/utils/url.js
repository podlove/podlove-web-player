import queryString from 'query-string'
import { isString } from 'lodash'

import { toPlayerTime } from 'utils/time'

export const locationParams = queryString.parse(window.location.search)

const parseParameters = parameters => {
  const parsed = {}

  if (parameters.t) {
    const [start, stop] = parameters.t.split(',')
    parsed.starttime = isString(start) ? toPlayerTime(start) : undefined
    parsed.stoptime = isString(stop) ? toPlayerTime(stop) : undefined
  }

  if (parameters.episode) {
    parsed.episode = parameters.episode
  }

  if (parameters.autoplay) {
    parsed.autoplay = true
  }

  return parsed
}

export const urlParameters = { ...parseParameters(locationParams) }

export const addQueryParameter = (url, additionalParameters = {}) => {
  const parser = document.createElement('a')
  parser.href = url

  const existingParameters = queryString.parse(parser.search)
  parser.search = queryString.stringify(Object.assign({}, existingParameters, additionalParameters), { encode: false })

  return parser.href
}
