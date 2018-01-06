import actions from 'store/actions'
import { get, last, find, isNumber } from 'lodash'
import { compose, map, concat, orderBy, reduce } from 'lodash/fp'
import request from 'utils/request'

import { toPlayerTime, secondsToMilliseconds } from 'utils/time'

const transformTime = time => isNumber(time) ? secondsToMilliseconds(time) : toPlayerTime(time)

const transformTranscript = reduce((transcripts, chunk) => {
  const lastChunk = last(transcripts)
  if (lastChunk && lastChunk.speaker && lastChunk.speaker === chunk.speaker) {
    transcripts[transcripts.length - 1].end = transformTime(chunk.end)

    transcripts[transcripts.length - 1].texts.push({
      start: transformTime(chunk.start),
      end: transformTime(chunk.end),
      text: chunk.text
    })

    return transcripts
  }

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

export default ({ dispatch }, { type, payload }) => {
  switch (type) {
    case 'INIT':
      const transcriptsUrl = get(payload, 'transcripts')
      const chapters = get(payload, 'chapters').map(transformChapters)
      const assignSpeakers = mapSpeakers(get(payload, 'contributors'))

      request(transcriptsUrl)
        .then(transformTranscript)
        .then(assignSpeakers)
        .then(concat(chapters))
        .then(orderBy('start', 'asc'))
        .catch(() => [])
        .then(compose(dispatch, actions.setTranscripts))
      break
  }
}
