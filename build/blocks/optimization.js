const { prepend } = require('./dir')

const ignoredAssets = ['embed', 'extensions/external-events']

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
        chunks: chunk => !~ignoredAssets.indexOf(chunk.name),
        minChunks: 1
      }
    }
  },
  runtimeChunk: false
})
