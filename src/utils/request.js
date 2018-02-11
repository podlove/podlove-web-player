import request from 'superagent'

export default url =>
  typeof url === 'string'
    ? request
        .get(url)
        .query({ format: 'json' })
        .set('Accept', 'application/json')
        .then(res => res.body)
    : new Promise(resolve => resolve(url))
