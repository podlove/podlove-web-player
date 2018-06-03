import 'babel-polyfill'
import { urlParameters } from 'utils/url'
import remoteConfig from 'utils/request'

import app from '../app'

remoteConfig(urlParameters.episode)
  .then(config => ({ ...config, display: 'embed' }))
  .then(app)
  .then(() => {
    console.log(window.STORE)
  })
  .catch(err => {
    console.group(`Can't load Podlove Webplayer`)
    console.error('config', urlParameters.episode)
    console.error(err)
    console.groupEnd()
  })

  /*
  store.dispatch({
    type: SET_PLAYBACK_PARAMS,
    payload: urlParameters
  })

  return store
  */
