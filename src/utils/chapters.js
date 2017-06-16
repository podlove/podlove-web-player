import { find, findIndex } from 'lodash/fp'

const currentChapterIndex = findIndex({active: true})

const currentChapter = find({active: true})

export {
  currentChapter,
  currentChapterIndex
}
