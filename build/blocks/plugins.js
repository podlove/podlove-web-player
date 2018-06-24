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

const css = () => new MiniCssExtractPlugin({
  filename: `[name].css`
})

const minifyCss = () => new OptimizeCSSAssetsPlugin({})

const version = () => new WebpackAutoInject({ SILENT: true })

const base = base =>
  new webpack.DefinePlugin({
    BASE: JSON.stringify(base)
  })

const html = prefix => new HtmlWebpackPlugin({
  filename: 'share.html',
  template: path.resolve(sourceDir, 'statics', 'share.html'),
  excludeChunks: [ 'embed', prepend('window', prefix) ]
})

const jarvis = (port = 1337) => new Jarvis({ port })

const bundleAnalyzer = () => new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  openAnalyzer: false
})

const hmr = () => new webpack.HotModuleReplacementPlugin()

module.exports = {
  vue, css, minifyCss, version, base, html, jarvis, bundleAnalyzer, hmr
}
