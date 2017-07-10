import { head } from 'lodash'

import runtime from 'utils/runtime'
import { Renderer } from 'core'
import i18n from 'lang'

// Store
import store from 'store'

// UI Components
import App from './components/App.vue'

// Import share static page
// eslint-disable-next-line
require('file-loader?name=share.html!./statics/share.html')

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
