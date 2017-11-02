import IntervalTree from 'interval-tree2'

import { noop, debounce } from 'lodash'
import { compose, head, get } from 'lodash/fp'
import { prohibitiveDispatch } from 'utils/effects'
import { inAnimationFrame } from 'utils/helper'

import actions from 'store/actions'

let update = noop
let debouncedUpdate = noop

const buildIndex = (duration = 0, data = []) => {
  const timeIndex = new IntervalTree(duration / 2)

  data.map(({type, start, end}, index) => {
    if (type !== 'transcript') {
      return
    }

    if (start > end) {
      return
    }

    timeIndex.add(start, end, index)
  })

  return (time) => time ? timeIndex.search(time) : []
}

export default ({ dispatch, getState }, { type, payload }) => {
  let playtime
  let duration

  switch (type) {
    case 'SET_TRANSCRIPTS':
      const state = getState()

      duration = get('duration')(state)
      playtime = get('playtime')(state)

      // Build index
      const indexSearch = compose(prohibitiveDispatch(dispatch, actions.updateTranscripts), get('id'), head, buildIndex(duration, payload))

      update = inAnimationFrame(indexSearch)
      debouncedUpdate = debounce(indexSearch, 200)

      update(playtime)
      break
    case 'SET_PLAYTIME':
    case 'UPDATE_PLAYTIME':
      update(payload)
      break
    case 'DISABLE_GHOST_MODE':
      playtime = compose(get('playtime'), getState)()
      debouncedUpdate(playtime)
      break
    case 'SIMULATE_PLAYTIME':
      debouncedUpdate(payload)
      break
  }
}
