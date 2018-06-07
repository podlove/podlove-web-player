/* globals BASE, VERSION */
import {
  get,
  compose
} from 'lodash'
import {
  iframeResizer
} from 'iframe-resizer'
// eslint-disable-next-line
import iframeResizerContentWindow from 'raw-loader!iframe-resizer/js/iframeResizer.contentWindow.js'

import {
  findNode,
  tag,
  setAttributes
} from 'utils/dom'
import requestConfig from 'utils/request'
import {
  urlParameters
} from 'utils/url'
import {
  sandbox,
  sandboxWindow
} from 'utils/sandbox'
import {
  SET_PLAYBACK_PARAMS
} from 'store/types'

import loader from './loader'

const createPlayerDom = config => [
  // Config
  tag('script', `window.PODLOVE = ${JSON.stringify(config)}`),

  // Loader
  loader(config),

  // Entry
  tag('PodlovePlayer'),

  // Bundles
  tag('link', '', {
    rel: 'stylesheet',
    href: `${get(config.reference, 'base', BASE)}/style.css?ver=${VERSION}`
  }),
  tag('script', '', {
    type: 'text/javascript',
    src: `${get(config.reference, 'base', BASE)}/vendor.js?ver=${VERSION}`
  }),
  tag('script', '', {
    type: 'text/javascript',
    src: `${get(config.reference, 'base', BASE)}/style.js?ver=${VERSION}`
  }),
  tag('script', '', {
    type: 'text/javascript',
    src: `${get(config.reference, 'base', BASE)}/window.js?ver=${VERSION}`
  }),

  // iFrameResizer
  tag('script', iframeResizerContentWindow)
].join('')

const resizer = sandbox => {
  iframeResizer({
    checkOrigin: false,
    log: false
  }, sandbox)

  return sandbox
}

const sandboxFromSelector = compose(sandbox, findNode)

const dispatchUrlParameters = store => {
  store.dispatch({
    type: SET_PLAYBACK_PARAMS,
    payload: urlParameters
  })

  return store
}

const setAccessibilityAttributes = config => {
  const title = `Podlove Web Player${get(config, 'title') ? ': ' + get(config, 'title') : ''}`

  return setAttributes({
    title,
    'aria-label': title,
    tabindex: 0
  })
}

window.podlovePlayer = (selector, episode) =>
  requestConfig(episode)
    .then(config =>
      Promise.resolve(config)
        .then(createPlayerDom)
        .then(sandboxFromSelector(selector))
        // Set Title for accessibility
        .then(setAccessibilityAttributes(config))
        .then(resizer)
        .then(sandboxWindow(['PODLOVE_STORE', 'store']))
        .then(dispatchUrlParameters)
    )
    .catch(err => {
      console.group(`Can't load Podlove Webplayer Version ${VERSION}`)
      console.error('selector', selector)
      console.error('config', episode)
      console.error(err)
      console.groupEnd()
    })
