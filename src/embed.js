import get from 'lodash/get'
import Bluebird from 'bluebird'
import { iframeResizer } from 'iframe-resizer'
import iframeResizerContentWindow from 'raw-loader!iframe-resizer/js/iframeResizer.contentWindow.min.js'

const findNode = selector => document.querySelectorAll(selector)
const createNode = tag => document.createElement(tag)
const appendNode = (node, child) => node.appendChild(child)

const tag = (tag, value = '', attributes = {}) => {
  let attr = Object.keys(attributes).map(attribute => ` ${attribute}="${attributes[attribute]}"`)

  attr = attr.join('')
  return `<${tag}${attr}>${value}</${tag}>`
}

const sandbox = () => {
  const frame = createNode('iframe')

  frame.style.width = '100%'
  frame.setAttribute('seamless', '')
  frame.setAttribute('scrolling', 'no')
  frame.style.border = '0'

  return frame
}

const sandboxDocument = iframe => get(iframe, ['contentWindow', 'document'])

const renderPlayer = (config, player) => anchor => {
  const injector = sandbox(config)

  appendNode(anchor, injector)

  const injectorDoc = sandboxDocument(injector)

  injectorDoc.open()
	injectorDoc.write(player)
	injectorDoc.close()

  iframeResizer({checkOrigin: false, log: true}, injector)
}

const generateConfig = config => {
  // TODO: check if url with meta information is provided
  return Bluebird.resolve(tag('script', `window.PODLOVE = ${JSON.stringify(config)}`))
}

window.podlovePlayer = (selector, config) => {
  const anchor = findNode(selector)

  const logic = tag('script', '', {type: 'text/javascript', src: './app.bundle.js'})
  const dynamicResizer = tag('script', iframeResizerContentWindow)
  const playerEntry = tag('PodlovePlayer')

  generateConfig(config).then(configObject => {
    anchor.forEach(renderPlayer(config, [
      playerEntry,
      configObject,
      logic,
      dynamicResizer
    ].join('')))
  })
}
