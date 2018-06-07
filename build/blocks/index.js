const entry = require('./entry')
const output = require('./output')
const resolve = require('./resolve')
const optimization = require('./optimization')
const rules = require('./rules')
const plugins = require('./plugins')
const devServer = require('./dev-server')

module.exports = {
  entry, output, optimization, rules, resolve, plugins, devServer
}
