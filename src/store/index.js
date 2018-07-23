import Vue from 'vue'
import { createStore, applyMiddleware, compose } from 'redux'
import { connect } from 'redux-vuex'

import effects from '../effects'
import reducers from './reducers'
import actions from './actions'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(reducers, composeEnhancers(applyMiddleware(effects)))

connect({ Vue, store, actions })

export default store
