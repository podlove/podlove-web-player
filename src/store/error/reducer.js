import { handleActions } from 'redux-actions'

import { NETWORK_EMPTY, NETWORK_NO_SOURCE, ERROR_MISSING_AUDIO_FILES } from '../types'

export const INITIAL_STATE = {
  message: null,
  title: null
}

const loadingError = {
  title: 'ERROR.LOADING.TITLE',
  message: 'ERROR.LOADING.MESSAGE'
}

export const reducer = handleActions({
  [NETWORK_EMPTY]: () => loadingError,
  [NETWORK_NO_SOURCE]: () => loadingError,

  [ERROR_MISSING_AUDIO_FILES]: () => ({
    title: 'ERROR.MISSING_FILES.TITLE',
    message: 'ERROR.MISSING_FILES.MESSAGE'
  })
}, INITIAL_STATE)
