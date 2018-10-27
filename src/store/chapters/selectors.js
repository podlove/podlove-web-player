import { get, compose } from 'lodash/fp'

export const selectChapters = get('list')
export const selectNextChapters = get('next')
export const selectPreviousChapter = get('previous')
export const selectCurrentChapter = get('current')
export const selectCurrentChapterTitle = compose(get('title'), selectCurrentChapter)
export const selectCurrentChapterImage = compose(get('image'), selectCurrentChapter)
