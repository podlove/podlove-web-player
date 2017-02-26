import Vue from 'vue'
import Revue from 'revue'
import { createStore, applyMiddleware, compose } from 'redux'

import reducers from './reducers'
import actions from './actions'
import effects from './effects'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const reduxStore = createStore(reducers, composeEnhancers(
    applyMiddleware(effects)
))

const store = new Revue(Vue, reduxStore, actions)

export default store
