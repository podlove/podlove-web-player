import Vue from 'vue'
import Revue from 'revue'
import { createStore } from 'redux'

import reducers from './reducers'
import actions from './actions'

const reduxStore = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

const store = new Revue(Vue, reduxStore, actions)

export default store
