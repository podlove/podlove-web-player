import queryString from 'query-string'
import { timeToSeconds } from 'utils/time'

const locationParams = queryString.parse(window.location.search)

const parsePlaytime = parameters => {
  if (parameters.playtime) {
    return {
      playtime: timeToSeconds(parameters.playtime)
    }
  }

  return {}
}

export const params = Object.assign({}, params, parsePlaytime(locationParams))

export const addQueryParameter = (url, additionalParameters = {}) => {
  const parser = document.createElement('a')
  parser.href = url

  const existingParameters = queryString.parse(parser.search)
  parser.search = queryString.stringify(Object.assign({}, existingParameters, additionalParameters), {encode: false})

  return parser.href
}
