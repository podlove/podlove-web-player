import transcripts from './transcripts.json'
import episodeUrl from './episode.json'
import episode from './episode'

const type = window.location.search ? window.location.search.replace('?', '') : null

const createPlayer = (config) => {
  document.body.appendChild(document.createElement('PodlovePlayer'))
  window.PODLOVE = config
}

const createEmbedPlayer = (url) => {
  const player = document.createElement('iframe')

  player.setAttribute('width', 768)
  player.setAttribute('height', 290)
  player.setAttribute('src', `//localhost:8080/share.html?episode=${url}&t=01:30`)
  player.setAttribute('frameborder', 0)
  player.setAttribute('scrolling', 'no')

  document.body.appendChild(player)
}

switch (type) {
  case 'embed':
    createEmbedPlayer(episodeUrl)
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
