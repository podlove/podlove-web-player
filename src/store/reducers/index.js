import {combineReducers} from 'redux'

import title from './title'
import subtitle from './subtitle'
import poster from './poster'

import duration from './duration'
import buffer from './buffer'
import playtime from './play-time'
import running from './running'
import lastAction from './last-action'

export default combineReducers({title, poster, subtitle, duration, buffer, playtime, running, lastAction})
