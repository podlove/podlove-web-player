const { distDir } = require('./dir')

module.exports = () => ({
  historyApiFallback: true,
  noInfo: true,
  overlay: true,
  inline: true,
  hot: true,
  disableHostCheck: true,
  host: '0.0.0.0',
  contentBase: distDir
})
