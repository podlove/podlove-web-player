import 'babel-polyfill'
import { urlParameters } from 'utils/url'
import remoteConfig from 'utils/request'

import { SET_PLAYBACK_PARAMS } from 'store/types'

import app from '../app'

remoteConfig(urlParameters.episode)
  .then(config => ({ ...config, display: 'embed' }))
  .then(app)
  .then(() => window.PODLOVE_STORE)
  .then(store => {
    store.dispatch({
      type: SET_PLAYBACK_PARAMS,
      payload: urlParameters
    })
    return store
  })
  .catch(err => {
    console.group(`Can't load Podlove Webplayer`)
    console.error('config', urlParameters.episode)
    console.error(err)
    console.groupEnd()
  })
