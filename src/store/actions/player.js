import store from 'store'

const setPlaytime = playtime => ({
    type: 'SET_PLAYTIME',
    payload: playtime
})

const updatePlaytime = playtime => ({
    type: 'UPDATE_PLAYTIME',
    payload: playtime
})

const setBuffer = buffer => ({
    type: 'SET_BUFFER',
    payload: buffer
})

const setDuration = duration => ({
    type: 'SET_DURATION',
    payload: duration
})

const play = () => ({
  type: 'UI_PLAY'
})

const pause = () => ({
    type: 'UI_PAUSE'
})

const playEvent = () => ({
    type: 'PLAY'
})

const pauseEvent = () => ({
    type: 'PAUSE'
})

export {
  setPlaytime,
  updatePlaytime,
  setDuration,
  setBuffer,
  play,
  playEvent,
  pause,
  pauseEvent
}
