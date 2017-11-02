import test from 'ava'
import { errorLoad, errorMissingAudioFiles } from './error'

test(`errorLoad: creates the NETWORK_NO_SOURCE action`, t => {
  t.deepEqual(errorLoad('NETWORK_NO_SOURCE'), {
    type: 'NETWORK_NO_SOURCE'
  })
})

test(`errorMissingAudioFiles: creates the ERROR_MISSING_AUDIO_FILES action`, t => {
  t.deepEqual(errorMissingAudioFiles(), {
    type: 'ERROR_MISSING_AUDIO_FILES'
  })
})
