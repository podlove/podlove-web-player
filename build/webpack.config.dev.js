const { entry, output, resolve, devServer, rules, plugins, optimization } = require('./blocks')

module.exports = {
  mode: 'development',

  entry: entry(),
  output: output(),
  resolve: resolve(),

  optimization: optimization(),

  devtool: 'inline-source-map',
  devServer: devServer(),

  module: {
    rules: [
      rules.vue(),
      rules.javascript(),
      rules.images(),
      rules.styles('dev'),
      rules.fonts()
    ]
  },

  plugins: [
    plugins.vue(),
    plugins.base('.'),
    plugins.jarvis(1337),
    plugins.bundleAnalyzer(),
    plugins.hmr(),
    plugins.html()
  ]
}
