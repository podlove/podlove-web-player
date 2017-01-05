import { combineReducers } from 'redux'

import * as meta from './meta'
import * as player from './player'
import * as effects from './effects'

export default combineReducers(
    Object.assign({}, meta, player, effects)
)
