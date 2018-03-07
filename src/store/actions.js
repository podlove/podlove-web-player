import * as buffer from './buffer/actions'
import * as chapters from './chapters/actions'
import * as components from './components/actions'
import * as download from './download/actions'
import * as duration from './duration/actions'
import * as error from './error/actions'
import * as ghost from './ghost/actions'
import * as muted from './muted/actions'
import * as player from './player/actions'
import * as playstate from './playstate/actions'
import * as playtime from './playtime/actions'
import * as quantiles from './quantiles/actions'
import * as rate from './rate/actions'
import * as runtime from './runtime/actions'
import * as share from './share/actions'
import * as tabs from './tabs/actions'
import * as theme from './theme/actions'
import * as transcripts from './transcripts/actions'
import * as volume from './volume/actions'
import * as playback from './playback/actions'

export default {
  ...buffer,
  ...chapters,
  ...components,
  ...download,
  ...duration,
  ...error,
  ...ghost,
  ...muted,
  ...player,
  ...playstate,
  ...playtime,
  ...quantiles,
  ...rate,
  ...runtime,
  ...share,
  ...tabs,
  ...theme,
  ...transcripts,
  ...volume,
  ...playback
}
