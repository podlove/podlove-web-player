const { resolve } = require('path')
const webpack = require('webpack')
const Jarvis = require('webpack-jarvis')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const baseConfig = require('./webpack.config.base')

module.exports = Object.assign({}, baseConfig, {
  mode: 'development',

  devtool: 'inline-source-map',

  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    inline: true,
    hot: true,
    disableHostCheck: true,
    host: '0.0.0.0',
    contentBase: resolve('.', 'dist')
  },

  module: {
    rules: [
      ...baseConfig.module.rules,
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'vue-style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },

  plugins: [
    ...baseConfig.plugins,
    new Jarvis({ port: 1337 }),

    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    }),

    new webpack.DefinePlugin({
      BASE: JSON.stringify('.')
    }),

    new webpack.HotModuleReplacementPlugin()
  ]
})
