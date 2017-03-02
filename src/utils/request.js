import request from 'superagent'

export default episode =>
  request
    .get(episode)
    .query({ format: 'json' })
    .set('Accept', 'application/json')
    .then(res => res.body)
