const { distDir } = require('./dir')

module.exports = publicPath => ({
  path: distDir,
  filename: '[name].js',
  publicPath
})
