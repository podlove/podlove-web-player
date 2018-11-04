import { compose, get } from 'lodash/fp'

import { selectors as chapters } from './chapters'
import { selectors as share } from './share'
import { selectors as files } from './files'
import { selectors as filter } from './filter'

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

// Files Tab
const filesSlice = get('files')
export const selectAudioFiles = compose(files.selectAudio, filesSlice)

// Filters
const filterSlice = get('filter')
export const selectActiveChannels = compose(filter.selectActiveChannels, filterSlice)
