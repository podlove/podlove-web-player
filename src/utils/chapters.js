import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'

const currentChapterIndex = findIndex({active: true})

const currentChapter = find({active: true})

export {
  currentChapter,
  currentChapterIndex
}
