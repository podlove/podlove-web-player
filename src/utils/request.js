import request from 'superagent'

export default url =>
  request
    .get(url)
    .query({ format: 'json' })
    .set('Accept', 'application/json')
    .then(res => res.body)
