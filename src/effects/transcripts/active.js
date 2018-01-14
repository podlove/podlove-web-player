import IntervalTree from 'interval-tree2'

import { noop, debounce } from 'lodash'
import { compose, head, get } from 'lodash/fp'

import { prohibitiveDispatch, handleActions } from 'utils/effects'
import { inAnimationFrame } from 'utils/helper'

import actions from 'store/actions'
import { SET_TRANSCRIPTS, SET_PLAYTIME, UPDATE_PLAYTIME, DISABLE_GHOST_MODE, SIMULATE_PLAYTIME } from 'store/types'

let update = noop
let debouncedUpdate = noop

const buildIndex = (duration = 0, data = []) => {
  const timeIndex = new IntervalTree(duration / 2)

  data.map(({type, start, end}, index) => {
    if (type !== 'transcript') {
      return
    }

    if (start >= end) {
      return
    }

    timeIndex.add(start, end, index)
  })

  return time => {
    if (time) {
      return timeIndex.search(time)
    }

    return []
  }
}

export default handleActions({
  [SET_TRANSCRIPTS]: ({ dispatch }, { payload }, { duration, playtime }) => {
    // Build index
    const indexSearch = compose(
      prohibitiveDispatch(dispatch, actions.updateTranscripts),
      get('id'),
      head,
      buildIndex(duration, payload)
    )

    update = inAnimationFrame(indexSearch)
    debouncedUpdate = debounce(indexSearch, 200)

    update(playtime)
  },

  [SET_PLAYTIME]: (store, { payload }) => update(payload),
  [UPDATE_PLAYTIME]: (store, { payload }) => update(payload),

  [DISABLE_GHOST_MODE]: (store, action, { playtime }) => debouncedUpdate(playtime),
  [SIMULATE_PLAYTIME]: (store, { payload }) => debouncedUpdate(payload)
})
