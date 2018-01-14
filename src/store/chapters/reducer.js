import { handleActions } from 'redux-actions'
import { findIndex, get } from 'lodash'

import { INIT, UPDATE_CHAPTER, NEXT_CHAPTER, PREVIOUS_CHAPTER, SET_CHAPTER } from '../types'

import { toPlayerTime } from 'utils/time'
import { currentChapterIndex } from 'utils/chapters'

const chapterMeta = (chapter, next) => ({
  start: toPlayerTime(chapter.start),
  end: toPlayerTime(next.start),
  title: chapter.title
})

const parseChapters = duration => (result, chapter, index, chapters) => {
  const end = get(chapters, index + 1, {start: duration})
  return [...result, chapterMeta(chapter, end)]
}

const inactiveChapter = chapter => ({
  ...chapter,
  active: false
})

const activeChapter = chapter => ({
  ...chapter,
  active: true
})

const setActiveByPlaytime = playtime => chapter => {
  if (playtime < chapter.start) {
    return inactiveChapter(chapter)
  }

  if (playtime >= chapter.end) {
    return inactiveChapter(chapter)
  }

  return activeChapter(chapter)
}

const fallbackToLastChapter = (playtime = 0) => (chapters = []) => {
  const index = findIndex(chapters, { active: true })

  return (index > 0 || playtime === 0) ? chapters : chapters.map(setActiveByIndex(chapters.length - 1))
}

const setActiveByIndex = chapterIndex => (chapter, index) =>
  chapterIndex === index ? activeChapter(chapter) : inactiveChapter(chapter)

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

export const reducer = handleActions({
  [INIT]: (state, { payload }) => {
    const chapters = get(payload, 'chapters', [])
      .reduce(parseChapters(toPlayerTime(payload.duration)), [])
      .map(setActiveByPlaytime(payload.playtime || 0))

    return fallbackToLastChapter(payload.playtime || 0)(chapters)
  },

  [UPDATE_CHAPTER]: (state, { payload }) => {
    const nextChapters = state.map(setActiveByPlaytime(payload))

    return currentChapterIndex(nextChapters) === -1 ? state : nextChapters
  },

  [NEXT_CHAPTER]: (state) => nextChapter(state),

  [PREVIOUS_CHAPTER]: (state) => previousChapter(state),

  [SET_CHAPTER]: (state, { payload }) => state.map(setActiveByIndex(payload))
}, INITIAL_STATE)
