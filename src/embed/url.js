import request from 'superagent'
import queryString from 'query-string'

import app from '../app'

const params = queryString.parse(window.location.search)

request
  .get(params.episode)
  .query({ format: 'json' })
  .set('Accept', 'application/json')
  .then(res => res.body)
  .then(res => {
    res.mode = 'share'
    return res
  })
  .then(app)
