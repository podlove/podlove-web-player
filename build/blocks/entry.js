const path = require('path')
const { sourceDir, prepend } = require('./dir')

module.exports = prefix => ({
  embed: path.resolve(sourceDir, 'embed', 'embed.js'),
  'extensions/external-events': path.resolve(sourceDir, 'extensions', 'external-events.js'),
  [prepend('window', prefix)]: path.resolve(sourceDir, 'embed', 'window.js'),
  [prepend('share', prefix)]: path.resolve(sourceDir, 'embed', 'share.js'),
  [prepend('vendor', prefix)]: path.resolve(sourceDir, 'vendor.js')
})
