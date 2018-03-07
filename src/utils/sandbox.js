import { compose, curry, get } from 'lodash/fp'
import { createNode, appendNode, setAttributes, setStyles } from './dom'

const SANDBOX_WIDTH = '768px'
const SANDBOX_HEIGHT = '230px'

const iframe = compose(
  setAttributes({
    'min-width': '100%',
    seamless: '',
    scrolling: 'no',
    frameborder: '0'
  }),
  setStyles({
    'max-width': SANDBOX_WIDTH,
    'min-height': SANDBOX_HEIGHT,
    transition: 'all 500ms',
    height: 'auto'
  }),
  createNode
)

const createFrame = anchor => new Promise((resolve) => resolve(iframe('iframe')))

export const sandboxWindow = selector => get(['contentWindow', ...selector])

const resize = curry((anchor, frame) => {
  const setFrameSize = () => setAttributes({ width: anchor.offsetWidth })(frame)

  setFrameSize()

  // Reset the width on viewport resize
  window.addEventListener('resize', setFrameSize)

  return frame
})

const inject = curry((content, sandbox) => new Promise(resolve => {
  const doc = sandboxWindow(['document'])(sandbox)

  const onLoad = () => {
    if (doc.readyState === 'complete') {
      return resolve(sandbox)
    }

    return setTimeout(onLoad, 150)
  }

  doc.open()
  doc.write('<!DOCTYPE html>')
  doc.write('<html>')
  doc.write('<head><meta charset="utf-8" /></head>')
  doc.write(content)
  doc.close()

  onLoad()
}))

export const sandbox = curry((anchor, content) =>
  createFrame(anchor)
    .then(appendNode(anchor))
    .then(resize(anchor))
    .then(inject(content))
)
