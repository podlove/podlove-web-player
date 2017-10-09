import episodeComponents from './components.episode'
import liveComponents from './components.live'

export default (store, action) => {
  const state = store.getState()

  if (state.mode === 'live') {
    liveComponents(store, action)
  } else {
    episodeComponents(store, action)
  }
}
