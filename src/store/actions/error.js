const errorLoad = error => ({
  type: error
})

const errorMissingAudioFiles = () => ({
  type: 'ERROR_MISSING_AUDIO_FILES'
})

export {
  errorLoad,
  errorMissingAudioFiles
}
