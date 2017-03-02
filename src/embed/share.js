import urlConfig from 'utils/url'
import remoteConfig from 'utils/request'

import app from '../app'

remoteConfig(urlConfig.episode)
  .then(config => Object.assign({}, config, urlConfig))
  .then(config => Object.assign({}, config, {mode: 'share'}))
  .then(app)
