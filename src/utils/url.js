import queryString from 'query-string'
import { timeToSeconds } from 'utils/time'

export const locationParams = queryString.parse(window.location.search)

const parseParameters = parameters => {
  const parsed = {}

  if (parameters.t) {
    parsed.playtime = timeToSeconds(parameters.t.split(','))
  }

  if (parameters.episode) {
    parsed.episode = parameters.episode
  }

  if (parameters.autoplay) {
    parsed.autoplay = true
  }

  return parsed
}

export const urlParameters = {...parseParameters(locationParams)}

export const addQueryParameter = (url, additionalParameters = {}) => {
  const parser = document.createElement('a')
  parser.href = url

  const existingParameters = queryString.parse(parser.search)
  parser.search = queryString.stringify(Object.assign({}, existingParameters, additionalParameters), {encode: false})

  return parser.href
}
