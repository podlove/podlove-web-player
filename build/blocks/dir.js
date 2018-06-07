const path = require('path')

const sourceDir = path.resolve(__dirname, '..', '..', 'src')
const distDir = path.resolve(__dirname, '..', '..', 'dist')
const prepend = (input, prefix) => prefix ? `${prefix}/${input}` : input

module.exports = { sourceDir, distDir, prepend }
