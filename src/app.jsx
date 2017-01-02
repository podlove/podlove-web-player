import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import cloneDeep from 'lodash/cloneDeep'

// Store
import store from './store'
import * as actions from './actions'
import * as effects from './effects'

// Media Driver
import mediaPlayer from './media-player'

// UI Components
import Player from './components/player/index.jsx'
import Header from './components/header/index.jsx'

// Meta Information
import domParser from './dom-parser'

// Styles
import './app.scss';

const meta = domParser(document)

// Initialize meta for store
actions.meta.setMeta(meta)

const media = mediaPlayer(meta.audio, {
  setPlaytime: actions.player.setPlaytime,
  setBufferState: actions.player.setBuffer,
  setDuration: actions.player.setDuration,
  onPlay: actions.player.playEvent,
  onPause: actions.player.pauseEvent
})

effects.registerMediaEffects(media)

ReactDOM.render(
  <Provider store={store}>
    <div className="podlove">
      <Header />
      <Player />
    </div>
  </Provider>,
  meta.player
)
