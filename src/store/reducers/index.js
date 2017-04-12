import { combineReducers } from 'redux'

import * as init from './init'
import * as player from './player'
import * as chapters from './chapters'
import * as tabs from './tabs'
import * as theme from './theme'
import * as share from './share'
import * as quantiles from './quantiles'

export default combineReducers(
    Object.assign({}, init, player, chapters, tabs, theme, share, quantiles)
)
