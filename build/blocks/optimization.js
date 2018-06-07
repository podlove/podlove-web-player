const { prepend } = require('./dir')

module.exports = prefix => ({
  splitChunks: {
    cacheGroups: {
      default: false,
      common: false,
      vendor: {
        chunks: chunk => ~[prepend('window', prefix), prepend('share', prefix)].indexOf(chunk.name),
        name: prepend('vendor', prefix),
        test: prepend('vendor', prefix),
        enforce: true
      },
      styles: {
        name: prepend('style', prefix),
        test: /\.(s?css|vue)$/,
        enforce: true,
        chunks: chunk => chunk.name !== 'embed',
        minChunks: 1
      }
    }
  },
  runtimeChunk: false
})
