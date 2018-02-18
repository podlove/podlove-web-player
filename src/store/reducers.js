import { combineReducers } from 'redux'

import { reducer as buffer } from './buffer'
import { reducer as chapters } from './chapters'
import { reducer as components } from './components'
import { reducer as display } from './display'
import { reducer as download } from './download'
import { reducer as duration } from './duration'
import { reducer as episode } from './episode'
import { reducer as error } from './error'
import { reducer as ghost } from './ghost'
import { reducer as lastAction } from './last-action'
import { reducer as mode } from './mode'
import { reducer as muted } from './muted'
import { reducer as playstate } from './playstate'
import { reducer as playtime } from './playtime'
import { reducer as quantiles } from './quantiles'
import { reducer as rate } from './rate'
import { reducer as reference } from './reference'
import { reducer as runtime } from './runtime'
import { reducer as share } from './share'
import { reducer as show } from './show'
import { reducer as speakers } from './speakers'
import { reducer as tabs } from './tabs'
import { reducer as theme } from './theme'
import { reducer as transcripts } from './transcripts'
import { reducer as visibleComponents } from './visible-components'
import { reducer as volume } from './volume'
import { reducer as playback } from './playback'

export default combineReducers({
  buffer,
  chapters,
  components,
  display,
  download,
  duration,
  episode,
  error,
  ghost,
  lastAction,
  mode,
  muted,
  playstate,
  playtime,
  quantiles,
  rate,
  reference,
  runtime,
  share,
  show,
  speakers,
  tabs,
  theme,
  transcripts,
  visibleComponents,
  volume,
  playback
})
