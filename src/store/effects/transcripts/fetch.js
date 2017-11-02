import actions from 'store/actions'
import { get, last, find, head, sortBy } from 'lodash'
import { compose, map, concat, orderBy, reduce } from 'lodash/fp'
import request from 'utils/request'

import { timeToSeconds } from 'utils/time'

const transformTranscript = reduce((transcripts, chunk) => {
  const lastChunk = last(transcripts)
  if (lastChunk && lastChunk.speaker && lastChunk.speaker === chunk.speaker) {
    transcripts[transcripts.length - 1].end = timeToSeconds(chunk.end)

    transcripts[transcripts.length - 1].texts.push({
      start: timeToSeconds(chunk.start),
      end: timeToSeconds(chunk.end),
      text: chunk.text
    })

    return transcripts
  }

  return [
    ...transcripts,
    {
      type: 'transcript',
      start: timeToSeconds(chunk.start),
      end: timeToSeconds(chunk.end),
      speaker: chunk.speaker,
      texts: [
        {
          start: timeToSeconds(chunk.start),
          end: timeToSeconds(chunk.end),
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
  start: timeToSeconds(chapter.start)
})

const mapSpeakers = speakers =>
  map(transcript => {
    if (transcript.type === 'chapter') {
      return transcript
    }

    const currentSpeaker = find(speakers, { id: transcript.speaker }) || {
      name: null,
      avatar: null
    }

    return {
      ...transcript,
      speaker: {
        name: currentSpeaker.name,
        avatar: currentSpeaker.avatar
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
