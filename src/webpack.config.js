const path = require('path')

const config = {
  context: path.resolve(__dirname, 'src'),
  entry: path.resolve(__dirname, 'app.jsx'),
  output: {
    path: path.resolve('dist'),
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /(node_modules)/,
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.scss$/,
      loaders: ['style', 'css', 'autoprefixer-loader?browsers=last 2 versions', 'sass']
    }, {
      test: /\.html$/,
      loader: 'html'
    }, {
      test: /.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'react']
      }
    }]
  },
  sassLoader: {
    includePaths: [path.resolve('node_modules'), path.resolve(__dirname, 'styles')]
  },
  devtool: 'eval-source-map'
}

module.exports = config
