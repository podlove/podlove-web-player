import actions from 'store/actions'
import { get, last, find } from 'lodash'
import { compose, map, concat, orderBy, reduce } from 'lodash/fp'
import request from 'utils/request'

import { toPlayerTime } from 'utils/time'

const transformTranscript = reduce((transcripts, chunk) => {
  const lastChunk = last(transcripts)
  if (lastChunk && lastChunk.speaker && lastChunk.speaker === chunk.speaker) {
    transcripts[transcripts.length - 1].end = toPlayerTime(chunk.end)

    transcripts[transcripts.length - 1].texts.push({
      start: toPlayerTime(chunk.start),
      end: toPlayerTime(chunk.end),
      text: chunk.text
    })

    return transcripts
  }

  return [
    ...transcripts,
    {
      type: 'transcript',
      start: toPlayerTime(chunk.start),
      end: toPlayerTime(chunk.end),
      speaker: chunk.speaker,
      texts: [
        {
          start: toPlayerTime(chunk.start),
          end: toPlayerTime(chunk.end),
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
  start: toPlayerTime(chapter.start)
})

const mapSpeakers = speakers =>
  map(transcript => {
    if (transcript.type === 'chapter') {
      return transcript
    }

    const result = find(speakers, { id: transcript.speaker })

    return {
      ...transcript,
      speaker: {
        name: get(result, 'name', null),
        avatar: get(result, 'avatar', null)
      }
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
