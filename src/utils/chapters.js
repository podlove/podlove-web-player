import { fallbackTo } from 'utils/helper'
import { find, findIndex, add, compose } from 'lodash/fp'

import { get } from 'lodash'

const emptyChapter = {
  start: null,
  end: null,
  title: null,
  href: null,
  index: -1
}

export const getChapterByIndex = chapters => index => get(chapters, index, emptyChapter)

export const currentChapterIndex = compose(fallbackTo(-1), findIndex({ active: true }))
export const currentChapter = compose(fallbackTo(emptyChapter), find({ active: true }))

export const nextChapter = chapters => compose(getChapterByIndex(chapters), add(1), currentChapterIndex)(chapters)
export const previousChapter = chapters => compose(getChapterByIndex(chapters), add(-1), currentChapterIndex)(chapters)

export const currentChapterByPlaytime = chapters => playtime => find(chapter => {
  if (playtime < chapter.start) {
    return false
  }

  if (playtime >= chapter.end) {
    return false
  }

  return true
})(chapters)

export const inactiveChapter = chapter => ({
  ...chapter,
  active: false
})

export const activeChapter = chapter => ({
  ...chapter,
  active: true
})

export const setActiveByPlaytime = playtime => chapter => {
  if (playtime < chapter.start) {
    return inactiveChapter(chapter)
  }

  if (playtime >= chapter.end) {
    return inactiveChapter(chapter)
  }

  return activeChapter(chapter)
}

export const setActiveByIndex = chapterIndex => (chapter, index) =>
  chapterIndex === index ? activeChapter(chapter) : inactiveChapter(chapter)
