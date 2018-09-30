const path = require('path')
const { sourceDir, prepend } = require('./dir')

const prod = prefix => ({
  embed: path.resolve(sourceDir, 'embed', 'embed.js'),
  'extensions/external-events': path.resolve(sourceDir, 'extensions', 'external-events.js'),
  [prepend('window', prefix)]: path.resolve(sourceDir, 'embed', 'window.js'),
  [prepend('share', prefix)]: path.resolve(sourceDir, 'embed', 'share.js')
})

const dev = () => ({
  embed: path.resolve(sourceDir, 'embed', 'embed.js'),
  'extensions/external-events': path.resolve(sourceDir, 'extensions', 'external-events.js'),
  window: path.resolve(sourceDir, 'embed', 'window.js'),
  share: path.resolve(sourceDir, 'embed', 'share.js'),
  example: path.resolve(sourceDir, 'statics', 'example', 'example.js')
})

module.exports = { prod, dev }
