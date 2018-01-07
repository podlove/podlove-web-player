import { createAction } from 'redux-actions'

import { ERROR_MISSING_AUDIO_FILES } from '../types'

export const errorLoad = error => ({
  type: error
})

export const errorMissingAudioFiles = createAction(ERROR_MISSING_AUDIO_FILES)
