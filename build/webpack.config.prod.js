const { get } = require('lodash')

const webpack = require('webpack')
const {
  createConfig,
  setEnv,
  addPlugins,
  uglify
} = require('webpack-blocks')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const vue = require('webpack-blocks-vue')

const { baseConfig } = require('./webpack.config.base')

module.exports = createConfig([
  ...baseConfig,

  setEnv({
    NODE_ENV: 'production'
  }),

  vue({
    loaders: {
      js: 'babel-loader',
      scss: ExtractTextPlugin.extract({
        fallback: 'vue-style-loader',
        use: [{
          loader: 'css-loader'
        }, {
          loader: 'sass-loader'
        }]
      })
    }
  }),

  uglify({
    parallel: true,
    cache: true,
    uglifyOptions: {
      compress: {
        warnings: false
      }
    }
  }),

  addPlugins([
    new ExtractTextPlugin('style.css'),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      chunks: ['share', 'window'],
      minChunks: Infinity
    }),

    new webpack.DefinePlugin({
      BASE: JSON.stringify(get(process.env, 'BASE', '.'))
    })
  ])
])
