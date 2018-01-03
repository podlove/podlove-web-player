import TextSearch from 'lunr'

import { noop, sortBy } from 'lodash'
import { compose, map } from 'lodash/fp'

import actions from 'store/actions'

import { prohibitiveDispatch } from 'utils/effects'
import { inAnimationFrame } from 'utils/helper'

let updateTranscript = noop

const buildIndex = (data = []) => {
  const textIndex = TextSearch(function () {
    this.field('text')
    data.map(({ texts = [], type }, index) => {
      if (type !== 'transcript') {
        return
      }

      this.add({ id: index, text: texts.reduce((result, item) => result + ' ' + item.text, '') })
    })
  })

  return (input = '') => {
    let result

    try {
      result = textIndex.search(`text:${input}`)
    } catch (e) {
      result = []
    }

    return result
  }
}

export default ({ dispatch, getState }, { type, payload }) => {
  switch (type) {
    case 'SET_TRANSCRIPTS':
      updateTranscript = inAnimationFrame(
        compose(
          prohibitiveDispatch(dispatch, actions.setTranscriptsSearchResults),
          sortBy,
          map(result => parseInt(result.ref)),
          buildIndex(payload)
        )
      )

      break
    case 'SEARCH_TRANSCRIPTS':
      updateTranscript(payload)
      break
  }
}
