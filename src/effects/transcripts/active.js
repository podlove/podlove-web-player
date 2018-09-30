import { binarySearch } from 'utils/binary-search'

import { noop, debounce } from 'lodash'
import { compose } from 'lodash/fp'

import { prohibitiveDispatch, handleActions } from 'utils/effects'
import { inAnimationFrame } from 'utils/helper'

import actions from 'store/actions'
import { SET_TRANSCRIPTS_TIMELINE, SET_TRANSCRIPTS_CHAPTERS, SET_PLAYTIME, UPDATE_PLAYTIME, DISABLE_GHOST_MODE, SIMULATE_PLAYTIME } from 'store/types'

let update = noop
let debouncedUpdate = noop

const createIndex = ({ dispatch }, { payload = [] }, { playtime }) => {
  const searchIndex = payload.map(({ start }) => start)

  update = inAnimationFrame(
    compose(
      prohibitiveDispatch(dispatch, actions.updateTranscripts),
      binarySearch(searchIndex)
    )
  )

  debouncedUpdate = debounce(update, 200)
  update(playtime)
}

export default handleActions({
  [SET_TRANSCRIPTS_TIMELINE]: createIndex,
  [SET_TRANSCRIPTS_CHAPTERS]: createIndex,

  [SET_PLAYTIME]: (_, { payload }) => update(payload),
  [UPDATE_PLAYTIME]: (_, { payload }) => update(payload),

  [DISABLE_GHOST_MODE]: (_, action, { playtime }) => debouncedUpdate(playtime),
  [SIMULATE_PLAYTIME]: (_, { payload }) => debouncedUpdate(payload)
})
