import { combineReducers } from 'redux'

import * as meta from './meta'
import * as player from './player'
import * as effects from './effects'
import * as chapters from './chapters'
import * as tabs from './tabs'
import * as theme from './theme'

export default combineReducers(
    Object.assign({}, meta, player, effects, chapters, tabs, theme)
)
