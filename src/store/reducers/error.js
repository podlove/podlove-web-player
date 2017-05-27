const INITIAL = {
  message: null,
  title: null
}

const error = (state = INITIAL, action) => {
  switch (action.type) {
    case 'ERROR_LOAD':
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
