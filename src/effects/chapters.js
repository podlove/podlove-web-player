import { get } from 'lodash'
import { getOr, compose } from 'lodash/fp'

import { currentChapter, currentChapterIndex } from 'utils/chapters'
import { handleActions } from 'utils/effects'

import actions from 'store/actions'

import { PREVIOUS_CHAPTER, NEXT_CHAPTER, SET_CHAPTER, SET_PLAYTIME, UPDATE_PLAYTIME } from 'store/types'

const chapterIndexFromState = compose(
  currentChapterIndex,
  getOr([], 'chapters')
)

const currentChapterFromState = compose(
  currentChapter,
  getOr([], 'chapters')
)

const chapterUpdate = ({ dispatch }, { payload }, state) => {
  const ghost = get(state, 'ghost', {})

  !ghost.active && dispatch(actions.updateChapter(payload))
}

export default handleActions({
  [PREVIOUS_CHAPTER]: ({ dispatch }, action, state) => {
    const index = chapterIndexFromState(state)
    const current = currentChapterFromState(state)

    dispatch(actions.updatePlaytime(index === 0 ? 0 : current.start))
  },

  [NEXT_CHAPTER]: ({ dispatch }, action, state) => {
    const index = chapterIndexFromState(state)
    const duration = get(state, 'duration', 0)
    const playtime = get(state, 'playtime', 0)
    const chapters = get(state, 'chapters', [])
    const current = currentChapterFromState(state)

    const chapterStart = (index === chapters.length - 1 && playtime >= current.start) ? duration : current.start

    dispatch(actions.updatePlaytime(chapterStart))
  },

  [SET_CHAPTER]: ({ dispatch }, action, state) => {
    const current = currentChapterFromState(state)
    dispatch(actions.updatePlaytime(current.start))
  },

  [SET_PLAYTIME]: chapterUpdate,
  [UPDATE_PLAYTIME]: chapterUpdate
})
