import { get } from 'lodash/fp'

export const selectors = {
  selectChapters: get('list'),
  selectNextChapters: get('next'),
  selectPreviousChapter: get('previous'),
  selectCurrentChapter: get('current'),
  selectCurrentChapterTitle: get('current.title'),
  selectCurrentChapterImage: get('current.image')
}
