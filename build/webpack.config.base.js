const path = require('path')
const { get } = require('lodash')

const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')

const { version } = require('../package')

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
    publicPath: get(process.env, 'BASE', '')
  },

  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
    alias: {
      store: path.resolve(sourceDir, 'store'),
      utils: path.resolve(sourceDir, 'utils'),
      shared: path.resolve(sourceDir, 'components', 'shared'),
      icons: path.resolve(sourceDir, 'components', 'icons'),
      lang: path.resolve(sourceDir, 'lang'),
      core: path.resolve(sourceDir, 'core'),
      styles: path.resolve(sourceDir, 'styles')
    }
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        common: false,
        vendor: {
          chunks: chunk => ~['window', 'share'].indexOf(chunk.name),
          name: 'vendor',
          test: 'vendor',
          enforce: true
        },
        styles: {
          name: 'style',
          test: /\.(s?css|vue)$/,
          enforce: true,
          chunks: chunk => chunk.name !== 'embed',
          minChunks: 1
        }
      }
    },
    runtimeChunk: false
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

  plugins: [
    new VueLoaderPlugin(),

    new webpack.DefinePlugin({
      BASE: JSON.stringify(get(process.env, 'BASE', '.')),
      VERSION: JSON.stringify(version)
    })
  ]
}
