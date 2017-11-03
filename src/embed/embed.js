import 'babel-polyfill'
import { get, head, isString } from 'lodash'
import Bluebird from 'bluebird'
import browser from 'detect-browser'

import { findNode, createNode, appendNode, tag } from 'utils/dom'
import requestConfig from 'utils/request'
import { urlParameters } from 'utils/url'

import { iframeResizer } from 'iframe-resizer'
// eslint-disable-next-line
import iframeResizerContentWindow from 'raw-loader!iframe-resizer/js/iframeResizer.contentWindow.min.js'

// Player renderer
const playerSandbox = anchor => {
  const frame = createNode('iframe')

  if (browser.name === 'ios') {
    frame.setAttribute('width', anchor.offsetWidth)
  } else {
    frame.setAttribute('width', '100%')
  }

  frame.setAttribute('min-width', '100%')
  frame.setAttribute('seamless', '')
  frame.setAttribute('scrolling', 'no')
  frame.setAttribute('frameborder', '0')

  appendNode(anchor, frame)
  return frame
}

const injectPlayer = (sandbox, player) => new Bluebird(resolve => {
  const sandboxDoc = get(sandbox, ['contentWindow', 'document'])

  const documentLoaded = () => {
    if (sandboxDoc.readyState === 'complete') {
      return resolve(sandbox)
    }

    return setTimeout(documentLoaded, 150)
  }

  sandboxDoc.open()
  sandboxDoc.write('<!DOCTYPE html>')
  sandboxDoc.write('<html>')
  sandboxDoc.write('<head><meta charset="utf-8" /></head>')
  sandboxDoc.write(player)
  sandboxDoc.close()

  return documentLoaded()
})

const getPodloveStore = sandbox =>
  get(sandbox, ['contentWindow', 'PODLOVE_STORE', 'store'])

const preloader = sandbox => ({
  init: () => {
    sandbox.style.opacity = 0
    // maximum width player
    sandbox.style['max-width'] = '768px'
    sandbox.style.transition = 'all 500ms'
  },
  done: () => {
    sandbox.style.opacity = 1
    sandbox.style.height = 'auto'
  }
})

const renderPlayer = anchor => player => {
  const sandbox = playerSandbox(anchor)
  const loader = preloader(sandbox)

  loader.init()

  return injectPlayer(sandbox, player)
    .then(sandbox => {
      iframeResizer({
        checkOrigin: false,
        log: false
      }, sandbox)

      loader.done()
    })
    .return(sandbox)
    .then(getPodloveStore)
}

const getConfig = (episode) =>
  Bluebird.resolve(episode)
    // If the config is a string, lets assume that this will point to the remote config json
    .then(config => isString(config) ? requestConfig(config) : config)

const dispatchUrlParameters = store => {
  store.dispatch({
    type: 'SET_URL_PARAMS',
    payload: urlParameters
  })

  return store
}

// Config Node
const configNode = (config = {}) => tag('script', `window.PODLOVE = ${JSON.stringify(config)}`)

// Player Logic
const styleBundle = config => tag('link', '', {rel: 'stylesheet', href: `${get(config.reference, 'base', '.')}/style.css`})
const vendorBundle = config => tag('script', '', {type: 'text/javascript', src: `${get(config.reference, 'base', '.')}/vendor.js`})
const appBundle = config => tag('script', '', {type: 'text/javascript', src: `${get(config.reference, 'base', '.')}/window.js`})

// Dynamic resizer
const dynamicResizer = tag('script', iframeResizerContentWindow)

// Transclusion point
const playerEntry = tag('PodlovePlayer')

// Bootstrap
window.podlovePlayer = (selector, episode) => {
  const anchor = typeof selector === 'string' ? head(findNode(selector)) : selector

  return getConfig(episode)
    .then(config => Bluebird.all([
      playerEntry,
      configNode(config),
      styleBundle(config),
      vendorBundle(config),
      appBundle(config),
      dynamicResizer
    ]))
    .then(result => result.join(''))
    .then(renderPlayer(anchor))
    .then(dispatchUrlParameters)
}
