import test from 'ava'
import { errorLoad, errorMissingAudioFiles } from './error'

test(`errorLoad: creates the ERROR_LOAD action`, t => {
  t.deepEqual(errorLoad(), {
    type: 'ERROR_LOAD'
  })
})

test(`errorMissingAudioFiles: creates the ERROR_MISSING_AUDIO_FILES action`, t => {
  t.deepEqual(errorMissingAudioFiles(), {
    type: 'ERROR_MISSING_AUDIO_FILES'
  })
})
