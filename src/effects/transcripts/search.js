import { textSearch } from 'utils/text-search'

import { noop } from 'lodash'
import { compose } from 'lodash/fp'

import { prohibitiveDispatch, handleActions } from 'utils/effects'
import { inAnimationFrame } from 'utils/helper'

import actions from 'store/actions'
import { SET_TRANSCRIPTS_TIMELINE, SEARCH_TRANSCRIPTS } from 'store/types'

let search = noop

export default handleActions({
  [SET_TRANSCRIPTS_TIMELINE]: ({ dispatch }, { payload = [] }) => {
    const searchIndex = payload
      .map(({ texts = [] }) => texts.map(({ text }) => text).join(' '))

    search = inAnimationFrame(
      compose(
        prohibitiveDispatch(dispatch, actions.setTranscriptsSearchResults),
        textSearch(searchIndex)
      )
    )
  },

  [SEARCH_TRANSCRIPTS]: (store, { payload }) => search(payload)
})
