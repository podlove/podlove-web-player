import { Howl } from 'howler'
import get from 'lodash/get'

import buffer from './buffer'

// console.log(new Howl())

/*
* Exposes Methods:
* - play
* - pause
* - load
*/
// const player = (element, {onPlayTimeUpdate, onMeta, onPause, onBufferUpdate}) => new Bluebird.Promise(resolve =>
//   new MediaElement(element, Object.assign({}, config, {
//     // method that fires when the Flash or Silverlight object is ready
//     success (player) {
//       // add event listener
//       player.addEventListener('timeupdate', () => onPlayTimeUpdate(player.currentTime), false)
//       player.addEventListener('timeupdate', buffer(player, onBufferUpdate), false)
//       player.addEventListener('loadeddata', () => onMeta(player.duration), false)
//       player.addEventListener('pause', onPause, false)

//       resolve(player)
//     },
//     // fires when a problem is detected
//     error (err) {
//       // TODO: global error state
//       console.log(err)
//     }
//   }))
// )

let ticker

export default (audio = [], {setPlaytime, setBufferState, setDuration, onPlay, onPause}) => {
  const player = new Howl({
    src: audio,
    html5: true,
    preload: false
  })

  let audioNode

  player.once('load', () => {
    // No api sugar for the audio node :/
    audioNode = get(player, ['_sounds', 0, '_node'])
    console.log(audioNode)
    setDuration(player.duration())
  })

  player.on('play', onPlay)

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
    onPause()
  })

  return player
}
