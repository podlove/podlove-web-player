import { get, last, find, isNumber } from 'lodash'
import { compose, map, concat, orderBy, reduce } from 'lodash/fp'

import request from 'utils/request'
import { toPlayerTime, secondsToMilliseconds } from 'utils/time'
import { handleActions } from 'utils/effects'

import actions from 'store/actions'
import { INIT } from 'store/types'

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

const transformChapters = (chapter, index) => ({
  ...chapter,
  type: 'chapter',
  index: index + 1,
  start: transformTime(chapter.start)
})

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
  [INIT]: ({ dispatch }, { type, payload }) => {
    const transcriptsUrl = get(payload, 'transcripts')
    const chapters = get(payload, 'chapters', []).map(transformChapters)
    const speakers = get(payload, 'contributors', []).filter(contributor => get(contributor, 'group.slug') === 'onair')
    const assignSpeakers = mapSpeakers(speakers)

    request(transcriptsUrl)
      .then(transformTranscript)
      .then(assignSpeakers)
      .then(concat(chapters))
      .then(orderBy('start', 'asc'))
      // Prevent a list of chapters only
      .then(transcripts => transcripts.length === chapters.length ? [] : transcripts)
      .catch(() => [])
      .then(compose(dispatch, actions.setTranscripts))
  }
})
