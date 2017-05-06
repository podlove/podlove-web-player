import { Howl } from 'howler'
import get from 'lodash/get'

import buffer from './buffer'
import extendPlayer from './extensions'

/*
* Exposes Methods:
* - play
* - pause
* - seek
*/
let ticker

export default (audio = [], {
  setPlaytime,
  setBufferState,
  setDuration,
  onPlay,
  onPause,
  onStop,
  onLoad,
  onError
}) => {
  const player = extendPlayer(new Howl({
    src: audio,
    html5: true,
    preload: false
  }), { onLoad })

  let audioNode

  // Load Hooks
  player.once('load', () => {
    // No api sugar for the audio node :/
    audioNode = get(player, ['_sounds', 0, '_node'])
    setDuration(player.duration())
  })

  // Playtime Hooks
  player.on('play', onPlay)

  player.on('play', () => {
    ticker = setInterval(() => {
      setPlaytime(player.seek())
      buffer(audioNode, setBufferState)
    }, 500)
  })

  // Pause Hooks
  player.on('pause', () => {
    clearInterval(ticker)
    onPause()
  })

  // Stop Hooks
  player.on('stop', () => {
    clearInterval(ticker)
    onStop()
  })

  // Error Hooks
  player.on('loaderror', () => {
    player.unload()
    onError()
  })

  return player
}
