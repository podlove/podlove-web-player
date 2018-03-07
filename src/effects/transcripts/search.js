import TextSearch from 'lunr'

import { noop, sortBy } from 'lodash'
import { compose, map } from 'lodash/fp'

import { prohibitiveDispatch, handleActions } from 'utils/effects'
import { inAnimationFrame } from 'utils/helper'

import actions from 'store/actions'
import { SET_TRANSCRIPTS, SEARCH_TRANSCRIPTS } from 'store/types'

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

export default handleActions({
  [SET_TRANSCRIPTS]: ({ dispatch }, { payload }) => {
    updateTranscript = inAnimationFrame(
      compose(
        prohibitiveDispatch(dispatch, actions.setTranscriptsSearchResults),
        sortBy,
        map(result => parseInt(result.ref)),
        buildIndex(payload)
      )
    )
  },

  [SEARCH_TRANSCRIPTS]: (store, { payload }) => updateTranscript(payload)
})
