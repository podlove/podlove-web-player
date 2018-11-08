import transcripts from './transcripts.json'
import episodeUrl from './episode.json'
import episode from './episode'

const type = window.location.search ? window.location.search.replace('?', '') : null

const createPlayer = (config) => {
  document.body.appendChild(document.createElement('PodlovePlayer'))
  window.PODLOVE = config
}

const createEmbedPlayer = (config) => {
  const script = document.createElement('script')
  const container = document.createElement('div')

  script.src = 'embed.js'

  script.addEventListener('load', () => {
    window.podlovePlayer(container, config)
  })

  document.body.appendChild(script)
  document.head.insertBefore(script, document.head.firstChild)
  document.body.appendChild(container)
}

const createSharePlayer = (url) => {
  const player = document.createElement('iframe')

  player.setAttribute('width', 768)
  player.setAttribute('height', 290)
  player.setAttribute('src', `/share.html?episode=${url}&t=01:30`)
  player.setAttribute('frameborder', 0)
  player.setAttribute('scrolling', 'no')

  document.body.appendChild(player)
}

switch (type) {
  case 'share':
    createSharePlayer(episodeUrl)
    break
  case 'embed':
    createEmbedPlayer(episode())
    break
  case 'transcripts':
    createPlayer(episode({ transcripts }))
    break
  case 'hls':
    createPlayer(episode({
      audio: [{
        url: 'https://media.metaebene.me/hls/freakshow/fs218-der-kann-kein-blut-hoeren.m3u8',
        size: '195',
        title: 'HLS Stream',
        mimeType: 'application/x-mpegURL'
      }]
    }))
    break
  default:
    createPlayer(episode())
}
