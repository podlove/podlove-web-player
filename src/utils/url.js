import queryString from 'query-string'
import { timeToSeconds } from 'utils/time'

const params = queryString.parse(window.location.search)

const parsePlaytime = parameters => {
  if (parameters.playtime) {
    return {
      playtime: timeToSeconds(parameters.playtime)
    }
  }

  return {}
}

export default Object.assign({}, params, parsePlaytime(params))
