/*
* Available Methods:
* - play
* - pause
* - load
*/
const player = (element, {onTick, onMeta}) =>
  new MediaElement(element, {
      defaultVideoWidth: -1,
      defaultVideoHeight: -1,
      videoWidth: -1,
      videoHeight: -1,
      audioWidth: -1,
      audioHeight: -1,
      startVolume: 0.8,
      loop: false,
      enableAutosize: true,
      features: ['playpause', 'current', 'progress', 'duration', 'tracks', 'fullscreen'],
      alwaysShowControls: false,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      alwaysShowHours: false,
      showTimecodeFrameCount: false,
      framesPerSecond: 1,
      enableKeyboard: true,
      pauseOtherPlayers: true,
      duration: false,
      plugins: ['flash', 'silverlight'],
      pluginPath: './bin/',
      flashName: 'flashmediaelement.swf',
      silverlightName: 'silverlightmediaelement.xap',
      // method that fires when the Flash or Silverlight object is ready
      success: function (player) {
          // add event listener
      player.addEventListener('timeupdate', () =>
        store.dispatch({
          type: 'SET_PLAYTIME',
          payload: player.currentTime
        }), false)

      player.addEventListener('loadeddata', () =>
        store.dispatch({
          type: 'SET_DURATION',
          payload: player.duration
        }), false)

      // player.addEventListener('play', () =>
      //   store.dispatch({
      //     type: 'PLAY'
      //   }), false)

      // player.addEventListener('pause', () =>
      //   store.dispatch({
      //     type: 'PAUSE'
      //   }), false)
      },
      // fires when a problem is detected
      error: function () {

      }
  })

export default player
