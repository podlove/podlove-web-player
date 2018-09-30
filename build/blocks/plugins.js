const path = require('path')
const webpack = require('webpack')

const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackAutoInject = require('webpack-auto-inject-version')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Jarvis = require('webpack-jarvis')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const { sourceDir, prepend } = require('./dir')

const vue = () => new VueLoaderPlugin()

const css = (prefix = '') => new MiniCssExtractPlugin({
  filename: prepend('[name].css', prefix)
})

const minifyCss = () => new OptimizeCSSAssetsPlugin({})

const version = () => new WebpackAutoInject({ SILENT: true })

const base = base =>
  new webpack.DefinePlugin({
    BASE: JSON.stringify(base)
  })

const shareHtml = prefix => new HtmlWebpackPlugin({
  filename: 'share.html',
  template: path.resolve(sourceDir, 'statics', 'share.html'),
  excludeChunks: [ 'embed', prepend('window', prefix) ]
})

const devHtml = (...files) => files.map(file =>
  new HtmlWebpackPlugin({
    filename: file,
    template: path.resolve(sourceDir, 'statics', 'example', file),
    chunksSortMode: 'none',
    chunks: ['example', 'vendor', 'style', 'window'],
    excludeChunks: ['embed', 'share']
  })
)

const jarvis = (port = 1337) => new Jarvis({ port })

const bundleAnalyzer = () => new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  openAnalyzer: false
})

const hmr = () => new webpack.HotModuleReplacementPlugin()

const env = mode => new webpack.DefinePlugin({
  mode: JSON.stringify(mode)
})

module.exports = {
  vue, css, minifyCss, version, base, shareHtml, devHtml, jarvis, bundleAnalyzer, hmr, env
}
