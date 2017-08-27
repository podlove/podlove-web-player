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

const restart = () => ({
  type: 'UI_RESTART'
})

const load = () => ({
  type: 'LOAD'
})

const idle = () => ({
  type: 'IDLE'
})

const playEvent = () => ({
  type: 'PLAY'
})

const pauseEvent = () => ({
  type: 'PAUSE'
})

const endEvent = () => ({
  type: 'END'
})

const toggleTimerMode = () => ({
  type: 'TOGGLE_TIMERMODE'
})

const loading = playerProps => ({
  type: 'LOADING',
  payload: playerProps
})

const loaded = playerProps => ({
  type: 'LOADED',
  payload: playerProps
})

const setVolume = volume => ({
  type: 'SET_VOLUME',
  payload: volume
})

const setRate = rate => ({
  type: 'SET_RATE',
  payload: rate
})

const mute = () => ({
  type: 'MUTE'
})

const unmute = () => ({
  type: 'UNMUTE'
})

export {
  setDuration,
  setBuffer,
  play,
  playEvent,
  pause,
  pauseEvent,
  endEvent,
  restart,
  idle,
  toggleTimerMode,
  loading,
  loaded,
  setVolume,
  setRate,
  mute,
  unmute,
  load
}
