import test from 'ava'
import { reducer as visibleComponents } from './reducer'

test(`visibleComponents: it loads the visibleComponents on INIT`, t => {
  const result = visibleComponents(undefined, {
    type: 'INIT',
    payload: {
      visibleComponents: ['tabInfo', 'tabChapters']
    }
  })

  t.deepEqual(result, {
    tabInfo: true,
    tabChapters: true
  })
})

test(`visibleComponents: it loads all visibleComponents on default`, t => {
  const result = visibleComponents(undefined, {
    type: 'FOOBAR'
  })

  t.deepEqual(result, {
    tabInfo: true,
    tabChapters: true,
    tabFiles: true,
    tabAudio: true,
    tabShare: true,
    tabTranscripts: true,
    progressbar: true,
    controlSteppers: true,
    controlChapters: true,
    episodeTitle: true,
    poster: true,
    showTitle: true,
    subtitle: true
  })
})

test(`visibleComponents: it loads all visibleComponents if not defined in payload`, t => {
  const result = visibleComponents(undefined, {
    type: 'INIT'
  })

  t.deepEqual(result, {
    tabInfo: true,
    tabChapters: true,
    tabFiles: true,
    tabAudio: true,
    tabShare: true,
    tabTranscripts: true,
    progressbar: true,
    controlSteppers: true,
    controlChapters: true,
    episodeTitle: true,
    poster: true,
    showTitle: true,
    subtitle: true
  })
})
