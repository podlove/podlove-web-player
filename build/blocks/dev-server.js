const { distDir } = require('./dir')

module.exports = (port = 8080) => ({
  historyApiFallback: true,
  noInfo: true,
  overlay: true,
  inline: true,
  hot: true,
  disableHostCheck: true,
  host: '0.0.0.0',
  contentBase: distDir,
  port
})
