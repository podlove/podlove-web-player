import { head } from 'lodash'

import runtime from 'utils/runtime'
import { Renderer } from 'core'
import i18n from 'lang'

// Import share static page
require('file-loader?name=share.html!./statics/share.html')

// Store
import store from 'store'

// UI Components
import App from './components/App.vue'

export default config => {
  // Enhance config with app debug information
  config = Object.assign({}, { runtime }, config)

  // Initialize meta for store
  store.dispatch(store.actions.init(config))

  window.PODLOVE_STORE = store

  return new Renderer({
    i18n,
    el: head(document.getElementsByTagName('PodlovePlayer')),
    render: h => h(App)
  })
}
