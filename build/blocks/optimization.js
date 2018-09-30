const { prepend } = require('./dir')
const ignoredChunks = ['embed', 'extensions/external-events']

module.exports = (prefix = '') => ({
  splitChunks: {
    cacheGroups: {
      default: false,
      vendors: false,
      vendor: {
        name: 'vendor',
        chunks: chunk => ~[prepend('window', prefix), prepend('share', prefix)].indexOf(chunk.name),
        test: /node_modules/
      },
      styles: {
        name: 'style',
        test: /\.(s?css|vue)$/,
        enforce: true,
        chunks: chunk => chunk.name && !~ignoredChunks.indexOf(chunk.name),
        minChunks: 1
      }
    }
  }
})
