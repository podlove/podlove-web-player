import { audio, events as audioEvents, actions as audioActions } from '@podlove/html5-audio-driver'
import { stereo, mono } from '@podlove/html5-audio-driver/filters'
import { attatchStream } from '@podlove/html5-audio-driver/hls'

export default (audioFiles) => {
  const audioElement = attatchStream(audio(audioFiles))

  const actions = {
    ...audioActions(audioElement),
    stereo: () => stereo(audioElement),
    mono: () => mono(audioElement)
  }

  return {
    events: audioEvents(audioElement),
    actions
  }
}
