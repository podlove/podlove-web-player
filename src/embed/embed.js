import get from 'lodash/get'
import Bluebird from 'bluebird'
import browser from 'detect-browser'

import { findNode, createNode, appendNode, tag } from 'utils/dom'
import requestConfig from 'utils/request'
import urlConfig from 'utils/url'

import { iframeResizer } from 'iframe-resizer'
import iframeResizerContentWindow from 'raw-loader!iframe-resizer/js/iframeResizer.contentWindow.min.js'

// Sandbox
const playerSandbox = () => {
  const frame = createNode('iframe')

  if (browser.name !== 'ios') {
    frame.style.width = '100%'
  }

  frame.setAttribute('seamless', '')
  frame.setAttribute('scrolling', 'no')
  frame.style.border = '0'

  return frame
}

// Player renderer
const renderPlayer = (config, player) => anchor => {
  const sandbox = playerSandbox(config)

  appendNode(anchor, sandbox)

  const sandboxDoc = get(sandbox, ['contentWindow', 'document'])

  sandboxDoc.open()
  sandboxDoc.write('<!DOCTYPE html>')
  sandboxDoc.write('<html>')
  sandboxDoc.write('<head></head>')
  sandboxDoc.write(player)
  sandboxDoc.close()

  iframeResizer({
    checkOrigin: false,
    log: false
  }, sandbox)
}

// Config Handling
const createConfigNode = (config = {}) =>
  tag('script', `window.PODLOVE = ${JSON.stringify(config)}`)

const remoteConfig = (config = {}) => {
  if (typeof config === 'string') {
    return requestConfig(config)
  }

  return Bluebird.resolve(config)
}

// Bootstrap
window.podlovePlayer = (selector, config) => {
  const anchor = typeof selector === 'string' ? findNode(selector) : [selector]

  const appLogic = tag('script', '', {type: 'text/javascript', src: './window.bundle.js'})
  const dynamicResizer = tag('script', iframeResizerContentWindow)
  const playerEntry = tag('PodlovePlayer')

  remoteConfig(config)
    // load parameters from url
    .then(config => anchor.length > 1 ? config : Object.assign({}, config, urlConfig))
    .then(createConfigNode)
    .then(configObject => {
      anchor.forEach(renderPlayer(config, [
        playerEntry,
        configObject,
        appLogic,
        dynamicResizer
      ].join('')))
    })
}
