import episodeStorage from './storage.episode'
import liveStorage from './storage.live'

export default storage => (store, action) => {
  const state = store.getState()

  if (state.mode === 'live') {
    liveStorage(storage, store, action)
  } else {
    episodeStorage(storage, store, action)
  }
}
