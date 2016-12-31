/* globals MediaElement */
import 'mediaelement' // srsly? ....
import Bluebird from 'bluebird'

import config from './config'
import buffer from './buffer'

/*
* Exposes Methods:
* - play
* - pause
* - load
*/
const player = (element, {onPlayTimeUpdate, onMeta, onPause, onBufferUpdate}) => new Bluebird.Promise(resolve =>
  new MediaElement(element, Object.assign({}, config, {
    // method that fires when the Flash or Silverlight object is ready
    success (player) {
      // add event listener
      player.addEventListener('timeupdate', () => onPlayTimeUpdate(player.currentTime), false)
      player.addEventListener('timeupdate', buffer(player, onBufferUpdate), false)
      player.addEventListener('loadeddata', () => onMeta(player.duration), false)
      player.addEventListener('pause', onPause, false)

      resolve(player)
    },
    // fires when a problem is detected
    error (err) {
      // TODO: global error state
      console.log(err)
    }
  }))
)

export default player
