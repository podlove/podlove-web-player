import Vue from 'vue'

// Store
import store from 'store'
import * as effects from './effects'

// Media Driver
import mediaPlayer from './media-player'

// // UI Components
import App from './components/App.vue'
// import Player from './components/player/index.jsx'
// import Header from './components/header/index.jsx'

// Meta Information
import domParser from './dom-parser'

// Styles
// import dimensions from './styles/dimensions'

const meta = domParser(document)

// Initialize meta for store
store.actions.setMeta(meta)

const media = mediaPlayer(meta.audio, {
  setPlaytime: store.actions.setPlaytime,
  setBufferState: store.actions.setBuffer,
  setDuration: store.actions.setDuration,
  onPlay: store.actions.playEvent,
  onPause: store.actions.pauseEvent
})

effects.registerMediaEffects(media)

new Vue({
  el: meta.player,
  render: h => h(App)
})
