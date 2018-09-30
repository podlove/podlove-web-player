const path = require('path')
const { sourceDir } = require('./dir')

module.exports = () => ({
  extensions: ['*', '.js', '.vue', '.json'],
  alias: {
    store: path.resolve(sourceDir, 'store'),
    utils: path.resolve(sourceDir, 'utils'),
    shared: path.resolve(sourceDir, 'components', 'shared'),
    icons: path.resolve(sourceDir, 'components', 'icons'),
    components: path.resolve(sourceDir, 'components'),
    lang: path.resolve(sourceDir, 'lang'),
    core: path.resolve(sourceDir, 'core'),
    styles: path.resolve(sourceDir, 'styles')
  }
})
