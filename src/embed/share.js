import 'babel-polyfill'
import { urlParameters } from 'utils/url'
import remoteConfig from 'utils/request'

import app from '../app'

remoteConfig(urlParameters.episode)
  .then(config => ({ ...config, display: 'embed' }))
  .then(app)
