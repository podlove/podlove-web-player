import { params } from 'utils/url'
import remoteConfig from 'utils/request'

import app from '../app'

remoteConfig(params.episode)
  .then(config => Object.assign({}, config, params))
  .then(config => Object.assign({}, config, {mode: 'share'}))
  .then(app)
