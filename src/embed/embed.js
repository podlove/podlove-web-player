import get from 'lodash/get'
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

  sandboxDoc.open()
  sandboxDoc.write('<!DOCTYPE html>')
  sandboxDoc.write('<html>')
  sandboxDoc.write('<head></head>')
  sandboxDoc.write(player)
  sandboxDoc.close()

  setInterval(() => {
    if (sandboxDoc.readyState !== 'complete') {
      return
    }

    resolve(sandbox)
  }, 150)
})

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

const renderPlayer = player => anchor => {
  const sandbox = playerSandbox(anchor)
  const loader = preloader(sandbox)

  loader.init()

  injectPlayer(sandbox, player)
    .then(() => {
      loader.done()
      iframeResizer({
        checkOrigin: false,
        log: false
      }, sandbox)
    })
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
const appLogic = tag('script', '', {type: 'text/javascript', src: './window.bundle.js'})

// Dynamic resizer
const dynamicResizer = tag('script', iframeResizerContentWindow)

// Transclusion point
const playerEntry = tag('PodlovePlayer')

// Bootstrap
window.podlovePlayer = (selector, config) => {
  const anchors = typeof selector === 'string' ? findNode(selector) : [selector]

  Bluebird.all([
    playerEntry,
    configNode(config),
    appLogic,
    dynamicResizer
  ])
  .then(result => result.join(''))
  .then(result => anchors.forEach(renderPlayer(result)))
}
