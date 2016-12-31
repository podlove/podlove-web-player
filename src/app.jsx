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

// Media Player
mediaPlayer(meta.audio, {
  onPlayTimeUpdate: actions.player.setPlaytime,
  onBufferUpdate: actions.player.setBuffer,
  onMeta: actions.player.setDuration,
  onPause: actions.player.pause
})
.then(effects.registerMediaEffects)

ReactDOM.render(
  <Provider store={store}>
    <div className="podlove">
      <Header />
      <Player />
    </div>
  </Provider>,
  meta.player
)

// TODO (aheimbuch): support multiple players
