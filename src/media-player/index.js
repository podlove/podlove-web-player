import { Howl } from 'howler'
import get from 'lodash/get'

import buffer from './buffer'

// console.log(new Howl())

/*
* Exposes Methods:
* - play
* - pause
* - seek
*/
let ticker

export default (audio = [], {setPlaytime, setBufferState, setDuration, onPlay, onPause, onStop, onLoad}) => {
  const player = new Howl({
    src: audio,
    html5: true,
    preload: false
  })

  let audioNode

  player.once('load', () => {
    console.log('loaded')
    // No api sugar for the audio node :/
    audioNode = get(player, ['_sounds', 0, '_node'])
    setDuration(player.duration())
  })

  player.on('play', onPlay)

  // Playtime
  player.on('play', () => {
    ticker = setInterval(() => {
      setPlaytime(player.seek())
      buffer(audioNode, setBufferState)
    }, 500)
  })

  player.on('pause', () => {
    clearInterval(ticker)
    onPause()
  })

  player.on('stop', () => {
    clearInterval(ticker)
    onStop()
  })

  return player
}
