import request from 'superagent'
import queryString from 'query-string'

import app from '../app'

const params = queryString.parse(window.location.search)

const overload = params => config => {
  config.mode = 'share'

  if (params.playtime) {
    config.playtime = params.playtime
    config.playstate = 'idle'
  }

  return config
}

request
  .get(params.episode)
  .query({ format: 'json' })
  .set('Accept', 'application/json')
  .then(res => res.body)
  .then(overload(params))
  .then(app)
