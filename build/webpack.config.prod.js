const autoprefixer = require('autoprefixer')
const cssClean = require('postcss-clean')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackAutoInject = require('webpack-auto-inject-version')

const baseConfig = require('./webpack.config.base')

module.exports = Object.assign({}, baseConfig, {
  mode: 'production',

  module: {
    rules: [
      ...baseConfig.module.rules,
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                cssClean({
                  inline: ['none']
                }),
                autoprefixer()
              ]
            }
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
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),

    new OptimizeCSSAssetsPlugin({}),

    new WebpackAutoInject()
  ]
})
