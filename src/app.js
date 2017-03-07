import Vue from 'vue'
import head from 'lodash/head'

import registerDirectives from './directives'

registerDirectives(Vue)

// Store
import store from 'store'

// UI Components
import App from './components/App.vue'

export default config => {
  // Initialize meta for store
  store.dispatch(store.actions.init(config))

  window.PODLOVE_STORE = store

  return new Vue({
    el: head(document.getElementsByTagName('PodlovePlayer')),
    render: h => h(App)
  })
}
