const { get } = require('lodash')

const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const cssClean = require('postcss-clean')

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const baseConfig = require('./webpack.config.base')

module.exports = Object.assign({}, baseConfig, {
  mode: 'production',

  module: {
    rules: [
      ...baseConfig.module.rules,
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [cssClean({
                  inline: ['none']
                }), autoprefixer()]
              }
            },
            {
              loader: 'sass-loader'
            }
          ]
        })
      }
    ]
  },

  plugins: [
    ...baseConfig.plugins,

    new ExtractTextPlugin('style.css'),

    new webpack.DefinePlugin({
      BASE: JSON.stringify(get(process.env, 'BASE', '.'))
    }),

    new UglifyJsPlugin()
  ]
})
