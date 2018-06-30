import { audio, events as audioEvents, actions as audioActions } from '@podlove/html5-audio-driver/src'
import { attatchStream } from '@podlove/html5-audio-driver/src/hls'

export default (audioFiles) => {
  const audioElement = attatchStream(audio(audioFiles))

  return {
    events: audioEvents(audioElement),
    actions: audioActions(audioElement)
  }
}
