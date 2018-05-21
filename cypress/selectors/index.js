const controllbar = require('./controllbar')
const progressbar = require('./progressbar')

module.exports = cy => Object.assign({}, controllbar(cy), progressbar(cy))
