import Vue from 'vue'
import Revue from 'revue'
import { createStore, applyMiddleware, compose } from 'redux'

import Raven from 'raven-js'
import createRavenMiddleware from 'raven-for-redux'

import { sentry, version } from '../../package.json'
import reducers from './reducers'
import actions from './actions'
import effects from './effects'

Raven.config(sentry, { release: version, ignoreUrls: ['localhost'] }).install()

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const reduxStore = createStore(reducers, composeEnhancers(
    applyMiddleware(createRavenMiddleware(Raven), effects)
))

const store = new Revue(Vue, reduxStore, actions)

export default store
