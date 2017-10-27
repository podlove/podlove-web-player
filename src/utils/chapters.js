import { find, findIndex } from 'lodash/fp'

const currentChapterIndex = findIndex({active: true})

const currentChapter = find({active: true})

const currentChapterByPlaytime = chapters => playtime => find(chapter => {
  if (playtime < chapter.start) {
    return false
  }

  if (playtime >= chapter.end) {
    return false
  }

  return true
})(chapters)

export {
  currentChapter,
  currentChapterIndex,
  currentChapterByPlaytime
}
