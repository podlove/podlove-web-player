const {
  babel,
  entryPoint,
  resolve,
  match,
  file,
  setOutput
} = require('webpack-blocks')

const path = require('path')

const sourceDir = path.resolve('.', 'src')
const distDir = path.resolve('.', 'dist')

const baseConfig = [
  entryPoint({
    embed: path.resolve(sourceDir, 'embed', 'embed.js'),
    window: path.resolve(sourceDir, 'embed', 'window.js'),
    share: path.resolve(sourceDir, 'embed', 'share.js'),
    vendor: path.resolve(sourceDir, 'vendor.js')
  }),

  setOutput({
    path: distDir,
    filename: '[name].js',
    publicPath: ''
  }),

  babel({
    presets: ['es2015']
  }),

  resolve({
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
  }),

  match(['*.gif', '*.jpg', '*.jpeg', '*.png', '*.svg'], [
    file({
      options: {
        name: '[name].[ext]?[hash]'
      }
    })
  ]),

  match(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2'], [
    file({
      options: {
        name: 'fonts/[name].[ext]?[hash]'
      }
    })
  ])
]

module.exports = {
  baseConfig,
  sourceDir,
  distDir
}
