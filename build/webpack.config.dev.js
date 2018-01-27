const {
  createConfig,
  devServer,
  sourceMaps,
  addPlugins,
  setDevTool
} = require('webpack-blocks')

const Jarvis = require('webpack-jarvis')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const vue = require('webpack-blocks-vue')

const { baseConfig, distDir } = require('./webpack.config.base')

module.exports = createConfig([
  ...baseConfig,

  vue({
    loaders: {
      js: 'babel-loader',
      scss: 'vue-style-loader!css-loader!autoprefixer-loader!sass-loader'
    }
  }),

  devServer({
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    inline: true,
    hot: true,
    disableHostCheck: true,
    host: '0.0.0.0',
    contentBase: distDir
  }),

  sourceMaps(),

  setDevTool('#eval-source-map'),

  addPlugins([
    new Jarvis({ port: 1337 }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ])
])
