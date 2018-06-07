const controllbar = require('./controllbar')
const progressbar = require('./progressbar')
const header = require('./header')

// Tabs
const audio = require('./tabs/audio')
const chapters = require('./tabs/chapters')
const download = require('./tabs/download')
const info = require('./tabs/info')
const share = require('./tabs/share')

module.exports = cy => Object.assign({}, controllbar(cy), progressbar(cy), header(cy), {
  tabs: {
    audio: audio(cy),
    chapters: chapters(cy),
    download: download(cy),
    info: info(cy),
    share: share(cy)
  }
})
