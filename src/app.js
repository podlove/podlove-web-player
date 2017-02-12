import Vue from 'vue'
import head from 'lodash/head'

import { timeToSeconds } from 'utils/time'


import clipboard from './directives/clipboard'

Vue.directive(
    'clipboard', clipboard
)

// Store
import store from 'store'
import * as effects from './effects'

// Media Driver
import mediaPlayer from './media-player'

// UI Components
import App from './components/App.vue'


export default config => {
  // Initialize meta for store
  store.dispatch(store.actions.init(config))

  const media = mediaPlayer(config.audio, {
    playtime: timeToSeconds(config.playtime),
    setPlaytime: playtime => store.dispatch(store.actions.setPlaytime(playtime)),
    setBufferState: buffer => store.dispatch(store.actions.setBuffer(buffer)),
    setDuration: duration => store.dispatch(store.actions.setDuration(duration)),
    onPlay: () => store.dispatch(store.actions.playEvent()),
    onPause: () => store.dispatch(store.actions.pauseEvent()),
    onStop: () => store.dispatch(store.actions.stopEvent()),
    onLoad: () => store.dispatch(store.actions.loading())
  })

  effects.registerMediaEffects(media)
  effects.registerIdleEffects()

  window.PODLOVE_STORE = store

  return new Vue({
    el: head(document.getElementsByTagName('PodlovePlayer')),
    render: h => h(App)
  })
}
