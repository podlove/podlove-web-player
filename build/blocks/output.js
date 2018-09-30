const { distDir, prepend } = require('./dir')

module.exports = (publicPath, prefix = '') => ({
  path: distDir,
  filename: '[name].js',
  chunkFilename: prepend('[name].js', prefix),
  publicPath
})
