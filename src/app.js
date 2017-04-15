import Vue from 'vue'
import head from 'lodash/head'

import debug from 'utils/debug'
import registerDirectives from './directives'

registerDirectives(Vue)

// Store
import store from 'store'

// UI Components
import App from './components/App.vue'

export default config => {
  // Enhance config with app debug information
  config = Object.assign({}, config, { debug })

  // Initialize meta for store
  store.dispatch(store.actions.init(config))

  window.PODLOVE_STORE = store

  return new Vue({
    el: head(document.getElementsByTagName('PodlovePlayer')),
    render: h => h(App)
  })
}
