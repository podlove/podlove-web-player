import get from 'lodash/get'
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

const audio = config => config.map(source => tag('source', '', source))

const show = config =>
  tag('title', config.title) +
  tag('subtitle', config.subtitle) +
  tag('summary', config.summary) +
  tag('poster', config.poster) +
  tag('url', config.url)

const chapters = config => config.map(chapter => tag('chapter', chapter.title, {'data-start': chapter.start}))


const sandbox = () => {
  const frame = createNode('iframe')

  frame.style.width = '100%'
  frame.setAttribute('seamless', '')
  frame.setAttribute('scrolling', 'no')

  return frame
}

const sandboxWindow = iframe => get(iframe, 'contentWindow')
const sandboxDocument = iframe => get(sandboxWindow(iframe), 'document')

const renderPlayer = (config, player) => anchor => {
  const injector = sandbox(config)

  appendNode(anchor, injector)
  const injectorDoc = sandboxDocument(injector)
  const injectorWindow = sandboxWindow(injector)

  injectorDoc.open()
	injectorDoc.write(player)
	injectorDoc.close()

  iframeResizer({checkOrigin: false}, injector)
}

window.podlovePlayer = (selector, config) => {
  const anchor = findNode(selector)

  const player =
    tag('podlovePlayer',
      tag('title', config.title) +
      tag('subtitle', config.subtitle) +
      tag('summary', config.summary) +
      tag('publicationDate', config.publicationDate) +
      tag('poster', config.poster) +
      tag('show', show(config.show)) +
      tag('chapters', chapters(config.chapters)) +
      tag('audio', audio(config.audio))
    )

  const logic = tag('script', '', {type: 'text/javascript', src: './app.bundle.js'})

  anchor.forEach(renderPlayer(config, player + logic + `<script>${iframeResizerContentWindow}</script>`))
}
