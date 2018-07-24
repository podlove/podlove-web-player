import { handleActions } from 'redux-actions'
import { compose, get } from 'lodash/fp'

import {
  UPDATE_CHAPTER,
  SET_NEXT_CHAPTER,
  SET_PREVIOUS_CHAPTER,
  SET_CHAPTER,
  INIT_CHAPTERS
} from '../types'

import {
  currentChapterIndex,
  setActiveByPlaytime,
  setActiveByIndex,
  nextChapter as getNextChapter,
  previousChapter as getPreviousChapter,
  currentChapter as getCurrentChapter
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

const generateState = chapters => ({
  list: chapters,
  current: getCurrentChapter(chapters),
  next: getNextChapter(chapters),
  previous: getPreviousChapter(chapters)
})

export const INITIAL_STATE = {
  list: [],
  current: null,
  next: null,
  previous: null
}

export const reducer = handleActions(
  {
    [INIT_CHAPTERS]: (_, { payload }) => generateState(payload),

    [UPDATE_CHAPTER]: (state, { payload }) => {
      const chapters = state.list.map(setActiveByPlaytime(payload))

      if (currentChapterIndex(chapters) === -1) {
        return state
      }

      return generateState(chapters)
    },

    [SET_NEXT_CHAPTER]: compose(generateState, nextChapter, get('list')),

    [SET_PREVIOUS_CHAPTER]: compose(generateState, previousChapter, get('list')),

    [SET_CHAPTER]: (state, { payload }) => {
      const chapters = state.list.map(setActiveByIndex(payload))
      return generateState(chapters)
    }
  },
  INITIAL_STATE
)
