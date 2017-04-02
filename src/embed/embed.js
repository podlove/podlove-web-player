import get from 'lodash/get'
import head from 'lodash/head'
import isString from 'lodash/isString'
import Bluebird from 'bluebird'
import browser from 'detect-browser'

import { findNode, createNode, appendNode, tag } from 'utils/dom'
import requestConfig from 'utils/request'
import urlConfig from 'utils/url'

import { iframeResizer } from 'iframe-resizer'
import iframeResizerContentWindow from 'raw-loader!iframe-resizer/js/iframeResizer.contentWindow.min.js'

// Player renderer
const playerSandbox = anchor => {
  const frame = createNode('iframe')

  if (browser.name !== 'ios') {
    frame.style.width = '100%'
  }

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
  sandboxDoc.write('<head></head>')
  sandboxDoc.write(player)
  sandboxDoc.close()

  return documentLoaded()
})

const getPodloveStore = sandbox =>
  get(sandbox, ['contentWindow', 'PODLOVE_STORE', 'store'])

const preloader = sandbox => ({
  init: () => {
    sandbox.style.opacity = 0
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
      loader.done()
      iframeResizer({
        checkOrigin: false,
        log: false
      }, sandbox)
    })
    .return(sandbox)
    .then(getPodloveStore)
}

// Config Node
const configNode = (config = {}) =>
  Bluebird.resolve(config)
    // If the config is a string, lets assume that this will point to the remote config json
    .then(config => isString(config) ? requestConfig(config) : config)
    // load parameters from url
    .then(config => Object.assign({}, config, urlConfig))
    // Finally return the node
    .then(config => tag('script', `window.PODLOVE = ${JSON.stringify(config)}`))

// Player Logic
const appLogic = tag('script', '', {type: 'text/javascript', src: './window.js'})

// Dynamic resizer
const dynamicResizer = tag('script', iframeResizerContentWindow)

// Transclusion point
const playerEntry = tag('PodlovePlayer')

// Bootstrap
window.podlovePlayer = (selector, config) => {
  const anchor = typeof selector === 'string' ? head(findNode(selector)) : selector

  return Bluebird.all([
      playerEntry,
      configNode(config),
      appLogic,
      dynamicResizer
    ])
    .then(result => result.join(''))
    .then(renderPlayer(anchor))
}
