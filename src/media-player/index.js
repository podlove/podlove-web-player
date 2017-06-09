import { Howl } from 'howler'

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

  // Playtime Hooks
  player.on('play', onPlay)

  player.once('load', () => setDuration(player.duration()))

  player.on('play', () => {
    ticker = setInterval(() => {
      setPlaytime(player.seek())
      player.onBuffer(setBufferState)
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
