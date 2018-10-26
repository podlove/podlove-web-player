import { compose, get } from 'lodash/fp'

import { selectors as chapters } from './chapters'
import { selectors as share } from './share'
// Chapters Tab
const chaptersSlice = get('chapters')
export const selectChapters = compose(chapters.selectChapters, chaptersSlice)
export const selectNextChapters = compose(chapters.selectNextChapters, chaptersSlice)
export const selectPreviousChapter = compose(chapters.selectPreviousChapter, chaptersSlice)
export const selectCurrentChapter = compose(chapters.selectCurrentChapter, chaptersSlice)
export const selectCurrentChapterTitle = compose(chapters.selectCurrentChapterTitle, chaptersSlice)
export const selectCurrentChapterImage = compose(chapters.selectCurrentChapterImage, chaptersSlice)

// Share Tab
const shareSlice = get('share')
export const selectShareContent = compose(share.selectShareContent, shareSlice)
