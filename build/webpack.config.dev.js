const { entry, output, resolve, devServer, rules, plugins, optimization } = require('./blocks')

module.exports = {
  mode: 'development',

  entry: entry.dev(),
  output: output(),
  resolve: resolve(),

  optimization: optimization(),

  devtool: 'inline-source-map',
  devServer: devServer(9002),

  module: {
    rules: [
      rules.vue(),
      rules.javascript(),
      rules.images(),
      rules.styles('dev'),
      rules.fonts(),
      rules.examples()
    ]
  },

  plugins: [
    plugins.vue(),
    plugins.base('.'),
    plugins.jarvis(1337),
    plugins.bundleAnalyzer(),
    plugins.hmr(),
    plugins.shareHtml(),
    ...plugins.devHtml('standalone.html'),
    plugins.env('development')
  ]
}
