import { get, noop } from 'lodash'
import { compose, map } from 'lodash/fp'

import { handleActions } from 'utils/effects'
import { secondsToMilliseconds, millisecondsToSeconds } from 'utils/time'

import actions from 'store/actions'

import { INIT, UI_PLAY, UI_PAUSE, UI_RESTART, UPDATE_PLAYTIME, SET_VOLUME, SET_RATE, MUTE, UNMUTE, LOAD } from 'store/types'

let playerActions = {
  setPlaytime: noop,
  play: noop,
  pause: noop,
  restart: noop,
  setVolume: noop,
  setRate: noop,
  mute: noop,
  unmute: noop,
  load: noop,
  stereo: noop,
  mono: noop
}

export default mediaPlayer => handleActions({
  [INIT]: ({ dispatch }, { payload }) => {
    const audioFiles = get(payload, 'audio', [])

    if (audioFiles.length === 0) {
      return
    }

    const player = mediaPlayer(audioFiles)

    playerActions = player.actions

    // register events
    player.events.onPlaytimeUpdate(compose(dispatch, actions.setPlaytime, secondsToMilliseconds))
    player.events.onDurationChange(compose(dispatch, actions.setDuration, secondsToMilliseconds))
    player.events.onBufferChange(compose(dispatch, actions.setBuffer, map(([start, stop]) => [secondsToMilliseconds(start), secondsToMilliseconds(stop)])))
    player.events.onPlay(compose(dispatch, actions.playEvent))
    player.events.onPause(compose(dispatch, actions.pauseEvent))
    player.events.onReady(compose(dispatch, actions.loaded))
    player.events.onError(compose(dispatch, actions.errorLoad))
    player.events.onBuffering(compose(dispatch, actions.loading))
    player.events.onEnd(compose(dispatch, actions.endEvent))
  },

  [UI_PLAY]: (_, actions, { playtime }) => {
    playerActions.setPlaytime(millisecondsToSeconds(playtime))
    playerActions.play()
  },

  [UI_PAUSE]: () => playerActions.pause(),

  [UI_RESTART]: () => {
    playerActions.play()
    playerActions.restart()
  },

  [UPDATE_PLAYTIME]: (_, { payload }) => playerActions.setPlaytime(millisecondsToSeconds(payload)),
  [SET_VOLUME]: (_, { payload }) => playerActions.setVolume(payload),
  [SET_RATE]: (_, { payload }) => playerActions.setRate(payload),
  [MUTE]: () => playerActions.mute(),
  [UNMUTE]: () => playerActions.unmute(),
  [LOAD]: () => playerActions.load()
})
