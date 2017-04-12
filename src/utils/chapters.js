import get from 'lodash/get'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'

const currentChapterIndex = findIndex({active: true})

const currentChapter = find({active: true})

const nextChapterPlaytime = (chapters = []) => {
  const current = currentChapterIndex(chapters)

  if (current === -1) {
    return null
  }

  if (current === chapters.length - 1) {
    return null
  }

  return chapters[current + 1].start
}

const previousChapterPlaytime = (chapters = [], playtime) => {
  const current = currentChapterIndex(chapters)

  switch (true) {
    case current <= 0:
      return get(chapters, [0, 'start'])

    case (playtime - chapters[current].start) <= 2:
      return chapters[current - 1].start

    default:
      return chapters[current].start
  }
}

export {
  currentChapter,
  currentChapterIndex,
  nextChapterPlaytime,
  previousChapterPlaytime
}
