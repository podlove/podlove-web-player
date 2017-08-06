const webpack = require('webpack')
const DashboardPlugin = require('webpack-dashboard/plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const path = require('path')
const { isArray, head } = require('lodash')
const devIp = require('dev-ip')

const getLocalIp = () => {
  const ip = devIp()

  if (isArray(ip)) {
    return head(ip)
  }

  if (ip) {
    return ip
  }

  return '0.0.0.0'
}

const config = {
  entry: {
    embed: path.resolve(__dirname, 'embed', 'embed.js'),
    window: path.resolve(__dirname, 'embed', 'window.js'),
    share: path.resolve(__dirname, 'embed', 'share.js'),
    vendor: path.resolve(__dirname, 'vendor.js')
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
    publicPath: ''
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]?[hash]'
      }
    }]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      store: path.resolve(__dirname, './store/index.js'),
      utils: path.resolve(__dirname, 'utils'),
      shared: path.resolve(__dirname, 'components', 'shared'),
      icons: path.resolve(__dirname, 'components', 'icons'),
      lang: path.resolve(__dirname, 'lang'),
      core: path.resolve(__dirname, 'core'),
      styles: path.resolve(__dirname, 'styles')
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    inline: true,
    hot: true,
    host: getLocalIp(),
    contentBase: path.resolve(__dirname, '..', 'dist')
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  plugins: [
    new ExtractTextPlugin('style.css')
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.devtool = '#source-map'

  config.module.rules = [...config.module.rules, {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      loaders: {
        js: 'babel-loader',
        scss: ExtractTextPlugin.extract({
          fallback: 'vue-style-loader',
          use: [{
            loader: 'css-loader'
          }, {
            loader: 'sass-loader'
          }]
        })
      }
    }
  }]

  config.plugins = [...config.plugins,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      chunks: ['share', 'window'],
      minChunks: Infinity
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'PRODUCTION': JSON.stringify(true)
    })
  ]
} else {
  config.module.rules = [...config.module.rules, {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      loaders: {
        js: 'babel-loader',
        scss: 'vue-style-loader!css-loader!autoprefixer-loader!sass-loader'
      }
    }
  }]

  config.plugins = [...config.plugins,
    new DashboardPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    }),
    new webpack.DefinePlugin({
      'PRODUCTION': JSON.stringify(false)
    })
  ]
}

module.exports = config
