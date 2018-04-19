import { get, last, find, isNumber } from 'lodash'
import { compose, map, concat, orderBy, reduce } from 'lodash/fp'

import request from 'utils/request'
import { toPlayerTime, secondsToMilliseconds } from 'utils/time'
import { handleActions } from 'utils/effects'

import actions from 'store/actions'
import { INIT, INIT_CHAPTERS, INIT_TRANSCRIPTS } from 'store/types'

const transformTime = time => isNumber(time) ? secondsToMilliseconds(time) : toPlayerTime(time)

const isNewChunk = (current, last) => {
  if (last === undefined) {
    return true
  }

  const differentSpeaker = current.speaker !== last.speaker
  const text = last.texts.reduce((result, item) => result + ' ' + item.text, '')
  const endOfSentence = new RegExp(/.*(\.|!|\?)$/).test(text) === false

  return differentSpeaker || (text.length > 500 && endOfSentence)
}

const transformTranscript = reduce((transcripts, chunk) => {
  const lastChunk = last(transcripts)

  if (isNewChunk(chunk, lastChunk)) {
    return [
      ...transcripts,
      {
        type: 'transcript',
        start: transformTime(chunk.start),
        end: transformTime(chunk.end),
        speaker: chunk.speaker,
        texts: [
          {
            start: transformTime(chunk.start),
            end: transformTime(chunk.end),
            text: chunk.text
          }
        ]
      }
    ]
  }

  return [
    ...transcripts.slice(0, -1),
    {
      ...lastChunk,
      end: transformTime(chunk.end),
      texts: [
        ...lastChunk.texts,
        {
          start: transformTime(chunk.start),
          end: transformTime(chunk.end),
          text: chunk.text
        }
      ]
    }
  ]
}, [])

const transformChapters = chapters => chapters.map((chapter, index) => ({
  ...chapter,
  type: 'chapter',
  index: index + 1,
}))

const mapSpeakers = speakers =>
  map(transcript => {
    if (transcript.type === 'chapter') {
      return transcript
    }

    const result = find(speakers, { id: transcript.speaker })

    return {
      ...transcript,
      speaker: result
    }
  })

export default handleActions({
  [INIT]: ({ dispatch }, { type, payload }, state) => {
    const transcriptsUrl = get(payload, 'transcripts')

    request(transcriptsUrl)
      .then(transformTranscript)
      .catch(() => [])
      .then(compose(dispatch, actions.initTranscripts))
  },

  [INIT_TRANSCRIPTS]: ({ dispatch }, { type, payload }, state) => {
    const speakers = get(state, 'speakers', [])
    const existingTranscripts = get(state, 'transcripts.timeline', [])
    const assignSpeakers = mapSpeakers(speakers)

    compose(
      dispatch,
      actions.setTranscriptsTimeline,
      orderBy('start', 'asc'),
      assignSpeakers,
      concat(existingTranscripts)
    )(payload)
  },

  [INIT_CHAPTERS]: ({ dispatch }, { type, payload }, state) => {
    const existingTranscripts = get(state, 'transcripts.timeline', [])

    compose(
      dispatch,
      actions.setTranscriptsChapters,
      orderBy('start', 'asc'),
      concat(existingTranscripts),
      transformChapters
    )(payload)
  }
})
