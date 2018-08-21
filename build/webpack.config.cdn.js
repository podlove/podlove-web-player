const { version } = require('../package')
const BASE = `//cdn.podlove.org/web-player/`

const { entry, output, resolve, optimization, rules, plugins } = require('./blocks')

module.exports = {
  mode: 'production',
  entry: entry.prod(version),
  output: output(BASE),

  optimization: optimization(version),

  resolve: resolve(),

  module: {
    rules: [
      rules.vue(),
      rules.javascript(),
      rules.images(),
      rules.styles('prod'),
      rules.fonts(version)
    ]
  },

  plugins: [
    plugins.vue(),
    plugins.css(),
    plugins.minifyCss(),
    plugins.version(),
    plugins.base(`${BASE}${version}`),
    plugins.shareHtml(version),
    plugins.env('production')
  ]
}
