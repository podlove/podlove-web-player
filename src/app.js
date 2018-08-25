import runtime from 'utils/runtime'
import { createApp } from 'core'

// Store
import store from 'store'
import actions from 'store/actions'

// UI Components
import App from './components/App'

export default config => {
  // Enhance config with app debug information
  config = {
    runtime,
    ...config
  }

  // Initialize meta for store
  store.dispatch(actions.init(config))

  window.PODLOVE_STORE = store

  return createApp('PodlovePlayer', App)
}
