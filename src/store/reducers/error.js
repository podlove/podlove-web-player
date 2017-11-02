const INITIAL = {
  message: null,
  title: null
}

const error = (state = INITIAL, action) => {
  switch (action.type) {
    case 'NETWORK_IDLE':
    case 'NETWORK_EMPTY':
    case 'NETWORK_NO_SOURCE':
      return {
        title: 'ERROR.LOADING.TITLE',
        message: 'ERROR.LOADING.MESSAGE'
      }
    case 'ERROR_MISSING_AUDIO_FILES':
      return {
        title: 'ERROR.MISSING_FILES.TITLE',
        message: 'ERROR.MISSING_FILES.MESSAGE'
      }
    default:
      return state
  }
}

export { error }
