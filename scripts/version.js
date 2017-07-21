const semver = require('semver')
const pkg = require('../package')
const version = `${semver.major(pkg.version)}.${semver.minor(pkg.version)}`
