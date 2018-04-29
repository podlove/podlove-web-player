const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')

const sourceDir = path.resolve('.', 'src')
const distDir = path.resolve('.', 'dist')

module.exports = {
  entry: {
    embed: path.resolve(sourceDir, 'embed', 'embed.js'),
    window: path.resolve(sourceDir, 'embed', 'window.js'),
    share: path.resolve(sourceDir, 'embed', 'share.js'),
    vendor: path.resolve(sourceDir, 'vendor.js')
  },

  output: {
    path: distDir,
    filename: '[name].js',
    publicPath: ''
  },

  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      store: path.resolve(sourceDir, 'store'),
      utils: path.resolve(sourceDir, 'utils'),
      shared: path.resolve(sourceDir, 'components', 'shared'),
      icons: path.resolve(sourceDir, 'components', 'icons'),
      lang: path.resolve(sourceDir, 'lang'),
      core: path.resolve(sourceDir, 'core'),
      styles: path.resolve(sourceDir, 'styles')
    }
  },

  module: {
    rules: [{
      test: /\.vue$/,
      use: 'vue-loader'
    }, {
      test: /\.js?$/,
      loader: 'babel-loader'
    }, {
      test: /\.(png|jpg|gif|jpeg|svg)$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]?[hash]'
      }
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'file-loader',
      options: {
        name: 'fonts/[name].[ext]?[hash]'
      }
    }]
  },

  plugins: [new VueLoaderPlugin()]
}
