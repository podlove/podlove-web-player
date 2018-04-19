import { fallbackTo } from 'utils/helper'
import { find, findIndex, compose } from 'lodash/fp'

const emptyChapter = {
  start: null,
  end: null
}

export const currentChapterIndex = compose(fallbackTo(-1), findIndex({active: true}))
export const currentChapter = compose(fallbackTo(emptyChapter), find({active: true}))

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
