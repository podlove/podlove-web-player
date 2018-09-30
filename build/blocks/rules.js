const { resolve } = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const autoprefixer = require('autoprefixer')
const cssClean = require('postcss-clean')

const {prepend, sourceDir} = require('./dir')

const vue = () => ({
  test: /\.vue$/,
  use: 'vue-loader'
})

const javascript = () => ({
  test: /\.js?$/,
  loader: 'babel-loader',
  exclude: [/node_modules/]
})

const images = prefix => ({
  test: /\.(png|jpg|gif|jpeg|svg)$/,
  loader: 'file-loader',
  options: {
    name: prepend('[name].[ext]?[hash]', prefix)
  }
})

const styles = mode => ({
  test: /\.scss$/,
  use: [
    mode === 'dev' ? {
      loader: 'vue-style-loader'
    } : MiniCssExtractPlugin.loader,
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
})

const fonts = prefix => ({
  test: /\.(eot|svg|ttf|woff|woff2)$/,
  loader: 'file-loader',
  options: {
    name: prepend('fonts/[name].[ext]?[hash]', prefix)
  }
})

const examples = () => ({
  test: /\.json$/,
  include: [resolve(sourceDir, 'statics', 'example')],
  type: 'javascript/auto',
  loader: 'file-loader'
})

module.exports = {
  vue, javascript, images, styles, fonts, examples
}
