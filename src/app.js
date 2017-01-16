import Vue from 'vue'
import head from 'lodash/head'

// Store
import store from 'store'
import * as effects from './effects'

// Media Driver
import mediaPlayer from './media-player'

// // UI Components
import App from './components/App.vue'

// Styles
const meta = window.PODLOVE

// Initialize meta for store
store.dispatch(store.actions.setMeta(meta))

const media = mediaPlayer(meta.audio, {
  setPlaytime: playtime => store.dispatch(store.actions.setPlaytime(playtime)),
  setBufferState: buffer => store.dispatch(store.actions.setBuffer(buffer)),
  setDuration: duration => store.dispatch(store.actions.setDuration(duration)),
  onPlay: () => store.dispatch(store.actions.playEvent()),
  onPause: () => store.dispatch(store.actions.pauseEvent()),
  onStop: () => store.dispatch(store.actions.stopEvent())
})

effects.registerMediaEffects(media)
effects.registerIdleEffects()

export default new Vue({
  el: head(document.getElementsByTagName('PodlovePlayer')),
  render: h => h(App)
})
