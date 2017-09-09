import test from 'ava'
import sinon from 'sinon'

import playerEffectsFactory from './player'

let store
let playerEffect
let mediaPlayer
let playStub, pauseStub, playtimeStub, volumeStub, rateStub, muteStub, unmuteStub, restartStub, loadStub

test.beforeEach(t => {
  playStub = sinon.stub()
  pauseStub = sinon.stub()
  playtimeStub = sinon.stub()
  volumeStub = sinon.stub()
  rateStub = sinon.stub()
  muteStub = sinon.stub()
  unmuteStub = sinon.stub()
  restartStub = sinon.stub()
  loadStub = sinon.stub()

  mediaPlayer = sinon.stub().returns({
    actions: {
      play: playStub,
      pause: pauseStub,
      setPlaytime: playtimeStub,
      setVolume: volumeStub,
      setRate: rateStub,
      mute: muteStub,
      unmute: unmuteStub,
      restart: restartStub,
      load: loadStub
    },
    events: {
      onPlaytimeUpdate: sinon.stub(),
      onDurationChange: sinon.stub(),
      onBufferChange: sinon.stub(),
      onPlay: sinon.stub(),
      onPause: sinon.stub(),
      onLoading: sinon.stub(),
      onLoaded: sinon.stub(),
      onError: sinon.stub(),
      onBuffering: sinon.stub(),
      onEnd: sinon.stub()
    }
  })

  store = {
    dispatch: sinon.stub(),
    getState: sinon.stub().returns({
      playtime: 100
    })
  }

  playerEffect = playerEffectsFactory(mediaPlayer)
})

test(`playerEffect: it exports a effect factory`, t => {
  t.is(typeof playerEffect, 'function')
})

test(`playerEffect: it creates the media element on INIT`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  t.truthy(mediaPlayer.called)
})

test(`playerEffect: it doesn't creates the media element on INIT on invalid config`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {}
  })

  t.falsy(mediaPlayer.called)
})

test(`playerEffect: it calls setPlaytime and play on UI_PLAY`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'UI_PLAY'
  })

  t.truthy(playStub.called)
  t.is(playtimeStub.getCall(0).args[0], 100)
})

test(`playerEffect: it calls pause on UI_PAUSE`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'UI_PAUSE'
  })

  t.truthy(pauseStub.called)
})

test(`playerEffect: it calls setPlaytime and play on UI_RESTART`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'UI_RESTART'
  })

  t.truthy(restartStub.called)
  t.truthy(playStub.called)
})

test(`playerEffect: it calls setPlaytime on UPDATE_PLAYTIME`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'UPDATE_PLAYTIME',
    payload: 100
  })

  t.is(playtimeStub.getCall(0).args[0], 100)
})

test(`playerEffect: it does nothing if mediaElement is not initialized`, t => {
  playerEffect(store, {
    type: 'UI_PLAY'
  })

  playerEffect(store, {
    type: 'UI_PAUSE'
  })

  playerEffect(store, {
    type: 'UPDATE_PLAYTIME',
    payload: 100
  })

  t.falsy(playStub.called)
  t.falsy(pauseStub.called)
  t.falsy(playtimeStub.called)
})

test(`playerEffect: it calls volume on SET_VOLUME`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'SET_VOLUME',
    payload: 100
  })

  t.is(volumeStub.getCall(0).args[0], 100)
})

test(`playerEffect: it calls rate on SET_RATE`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'SET_RATE',
    payload: 100
  })

  t.is(rateStub.getCall(0).args[0], 100)
})

test(`playerEffect: it calls mute on MUTE`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'MUTE'
  })

  t.truthy(muteStub.called)
})

test(`playerEffect: it calls unmute on UNMUTE`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'UNMUTE'
  })

  t.truthy(unmuteStub.called)
})

test(`playerEffect: it calls unmute on LOAD`, t => {
  playerEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  playerEffect(store, {
    type: 'LOAD'
  })

  t.truthy(loadStub.called)
})
