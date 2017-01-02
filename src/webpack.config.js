const webpack = require('webpack')

const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'

const config = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.resolve(__dirname, 'app.jsx'),
    loader: path.resolve(__dirname, 'loader.js')
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].bundle.js'
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
  }
}

if (isProduction) {
  config.plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
        screw_ie8: true
      },
      compressor: {
        warnings: false
      }
    })
  ]
} else {
  config.devtool = 'eval-source-map'
}

module.exports = config
