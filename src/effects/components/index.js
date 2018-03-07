import episodeComponents from './episode'
import liveComponents from './live'

export default (store, action) => {
  const state = store.getState()

  if (state.mode === 'live') {
    liveComponents(store, action)
  } else {
    episodeComponents(store, action)
  }
}
