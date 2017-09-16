import { get, findIndex } from 'lodash'
import { timeToSeconds } from 'utils/time'
import { currentChapterIndex } from 'utils/chapters'

const chapterMeta = (chapter, next) => ({
  start: timeToSeconds(chapter.start),
  end: timeToSeconds(next.start),
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

const fallbackToLastChapter = (chapters = [], playtime = 0) => {
  const index = findIndex(chapters, { active: true })

  if (index > 0 || playtime === 0) {
    return chapters
  } else {
    return chapters.map(setActiveByIndex(chapters.length - 1))
  }
}

const setActiveByIndex = chapterIndex => (chapter, index) => {
  if (chapterIndex === index) {
    return activeChapter(chapter)
  }

  return inactiveChapter(chapter)
}

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

const chapters = (state = [], action) => {
  switch (action.type) {
    case 'INIT':
      const chapters = get(action.payload, 'chapters') || []
      const activeChapters = chapters
        .reduce(parseChapters(action.payload.duration), [])
        .map(setActiveByPlaytime(action.payload.playtime || 0))

      return fallbackToLastChapter(activeChapters, action.payload.playtime || 0)

    case 'UPDATE_CHAPTER':
      const nextChapters = state.map(setActiveByPlaytime(action.payload))

      if (currentChapterIndex(nextChapters) === -1) {
        return state
      }

      return nextChapters
    case 'NEXT_CHAPTER':
      return nextChapter(state)
    case 'PREVIOUS_CHAPTER':
      return previousChapter(state)
    case 'SET_CHAPTER':
      return state.map(setActiveByIndex(action.payload))
    default:
      return state
  }
}

export {
  chapters
}
