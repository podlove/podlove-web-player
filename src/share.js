import request from 'superagent'
import queryString from 'query-string'

import boot from './boot'

const params = queryString.parse(window.location.search)

request
  .get(params.episode)
  .query({ format: 'json' })
  .set('Accept', 'application/json')
  .then(res => res.body)
  .then(boot)
