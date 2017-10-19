import { combineReducers } from 'redux'

import * as init from './init'
import * as components from './components'
import * as player from './player'
import * as playtime from './playtime'
import * as chapters from './chapters'
import * as tabs from './tabs'
import * as theme from './theme'
import * as share from './share'
import * as quantiles from './quantiles'
import * as runtime from './runtime'
import * as error from './error'
import * as ghost from './ghost'
import * as show from './show'
import * as episode from './episode'
import * as download from './download'
import * as contributors from './contributors'
import * as lastAction from './last-action'

export default combineReducers({
  ...init,
  ...components,
  ...player,
  ...playtime,
  ...chapters,
  ...tabs,
  ...theme,
  ...share,
  ...quantiles,
  ...runtime,
  ...error,
  ...ghost,
  ...show,
  ...episode,
  ...download,
  ...contributors,
  ...lastAction
})
