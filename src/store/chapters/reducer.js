import { handleActions } from 'redux-actions'

import {
  UPDATE_CHAPTER,
  NEXT_CHAPTER,
  PREVIOUS_CHAPTER,
  SET_CHAPTER,
  INIT_CHAPTERS
} from '../types'

import {
  currentChapterIndex,
  setActiveByPlaytime,
  setActiveByIndex
} from 'utils/chapters'

const nextChapter = chapters => {
  let next = currentChapterIndex(chapters) + 1

  if (next >= chapters.length - 1) {
    next = chapters.length - 1
  }

  return chapters.map(setActiveByIndex(next))
}

const previousChapter = chapters => {
  let previous = currentChapterIndex(chapters) - 1

  if (previous <= 0) {
    previous = 0
  }

  return chapters.map(setActiveByIndex(previous))
}

export const INITIAL_STATE = []

export const reducer = handleActions(
  {
    [INIT_CHAPTERS]: (state, { payload }) => payload,

    [UPDATE_CHAPTER]: (state, { payload }) => {
      const nextChapters = state.map(setActiveByPlaytime(payload))

      return currentChapterIndex(nextChapters) === -1 ? state : nextChapters
    },

    [NEXT_CHAPTER]: state => nextChapter(state),

    [PREVIOUS_CHAPTER]: state => previousChapter(state),

    [SET_CHAPTER]: (state, { payload }) => state.map(setActiveByIndex(payload))
  },
  INITIAL_STATE
)
