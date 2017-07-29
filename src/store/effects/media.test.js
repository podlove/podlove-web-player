import test from 'ava'
import sinon from 'sinon'

import mediaEffectFactory from './media'

let store
let mediaEffect
let mediaPlayer
let playStub, pauseStub, seekStub, volumeStub, rateStub, muteStub

test.beforeEach(t => {
  playStub = sinon.stub()
  pauseStub = sinon.stub()
  seekStub = sinon.stub()
  volumeStub = sinon.stub()
  rateStub = sinon.stub()
  muteStub = sinon.stub()

  mediaPlayer = sinon.stub().returns({
    play: playStub,
    pause: pauseStub,
    seek: seekStub,
    volume: volumeStub,
    rate: rateStub,
    mute: muteStub
  })

  store = {
    dispatch: sinon.stub(),
    getState: sinon.stub().returns({
      playtime: 100
    })
  }

  mediaEffect = mediaEffectFactory(mediaPlayer)
})

test(`mediaEffect: it exports a effect factory`, t => {
  t.is(typeof mediaEffect, 'function')
})

test(`mediaEffect: it creates the media element on INIT`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  t.truthy(mediaPlayer.called)
})

test(`mediaEffect: it doesn't creates the media element on INIT on invalid config`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {}
  })

  t.falsy(mediaPlayer.called)
})

test(`mediaEffect: it calls setPlaytime and play on UI_PLAY`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'UI_PLAY'
  })

  t.truthy(playStub.called)
  t.is(seekStub.getCall(0).args[0], 100)
})

test(`mediaEffect: it calls pause on UI_PAUSE`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'UI_PAUSE'
  })

  t.truthy(pauseStub.called)
})

test(`mediaEffect: it calls setPlaytime and play on UI_RESTART`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'UI_RESTART'
  })

  t.truthy(playStub.called)
  t.is(seekStub.getCall(0).args[0], 0)
})

test(`mediaEffect: it calls setPlaytime on UPDATE_PLAYTIME`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'UPDATE_PLAYTIME',
    payload: 100
  })

  t.is(seekStub.getCall(0).args[0], 100)
})

test(`mediaEffect: it does nothing if mediaElement is not initialized`, t => {
  mediaEffect(store, {
    type: 'UI_PLAY'
  })

  mediaEffect(store, {
    type: 'UI_PAUSE'
  })

  mediaEffect(store, {
    type: 'UPDATE_PLAYTIME',
    payload: 100
  })

  t.falsy(playStub.called)
  t.falsy(pauseStub.called)
  t.falsy(seekStub.called)
})

test(`mediaEffect: it calls volume on SET_VOLUME`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'SET_VOLUME',
    payload: 100
  })

  t.is(volumeStub.getCall(0).args[0], 100)
})

test(`mediaEffect: it calls rate on SET_RATE`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'SET_RATE',
    payload: 100
  })

  t.is(rateStub.getCall(0).args[0], 100)
})

test(`mediaEffect: it calls mute on MUTE`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'MUTE'
  })

  t.is(muteStub.getCall(0).args[0], true)
})

test(`mediaEffect: it calls unmute on UNMUTE`, t => {
  mediaEffect(store, {
    type: 'INIT',
    payload: {
      audio: [{url: 'foo'}]
    }
  })

  mediaEffect(store, {
    type: 'UNMUTE'
  })

  t.is(muteStub.getCall(0).args[0], false)
})
