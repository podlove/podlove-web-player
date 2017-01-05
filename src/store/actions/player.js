import store from 'store'

const setPlaytime = playtime => {
  store.dispatch({
    type: 'SET_PLAYTIME',
    payload: playtime
  })
}

const updatePlaytime = playtime => {
  store.dispatch({
    type: 'UPDATE_PLAYTIME',
    payload: playtime
  })
}

const setBuffer = buffer => {
  store.dispatch({
    type: 'SET_BUFFER',
    payload: buffer
  })
}

const setDuration = duration => {
  store.dispatch({
    type: 'SET_DURATION',
    payload: duration
  })
}

const play = () => {
  store.dispatch({
    type: 'UI_PLAY'
  })
}

const pause = () => {
  store.dispatch({
    type: 'UI_PAUSE'
  })
}

const playEvent = () => {
  store.dispatch({
    type: 'PLAY'
  })
}

const pauseEvent = () => {
  store.dispatch({
    type: 'PAUSE'
  })
}

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
