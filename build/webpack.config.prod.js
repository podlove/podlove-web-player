const { entry, output, resolve, optimization, rules, plugins } = require('./blocks')

module.exports = {
  mode: 'production',
  entry: entry.prod(),
  output: output(),

  optimization: optimization(),

  resolve: resolve(),

  module: {
    rules: [
      rules.vue(),
      rules.javascript(),
      rules.images(),
      rules.styles('prod'),
      rules.fonts()
    ]
  },

  plugins: [
    plugins.vue(),
    plugins.css(),
    plugins.minifyCss(),
    plugins.version(),
    plugins.base('.'),
    plugins.shareHtml(),
    plugins.env('production')
  ]
}
