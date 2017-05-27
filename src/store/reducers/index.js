import { combineReducers } from 'redux'

import * as init from './init'
import * as components from './components'
import * as player from './player'
import * as chapters from './chapters'
import * as tabs from './tabs'
import * as theme from './theme'
import * as share from './share'
import * as quantiles from './quantiles'
import * as runtime from './runtime'
import * as error from './error'

export default combineReducers(
    Object.assign({}, init, components, player, chapters, tabs, theme, share, quantiles, runtime, error)
)
