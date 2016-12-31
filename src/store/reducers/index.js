import {combineReducers} from 'redux'

import duration from './duration'
import playtime from './play-time'
import running from './running'
import lastAction from './last-action'

export default combineReducers({duration, playtime, running, lastAction})
