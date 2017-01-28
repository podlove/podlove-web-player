import get from 'lodash/get'
import { timeToSeconds } from 'utils/time'

const chapterMeta = (chapter, next) => ({
  start: timeToSeconds(chapter.start),
  end: timeToSeconds(next.start),
  title: chapter.title
})

const parseChapters = duration => (result, chapter, index, chapters) => {
  const end = get(chapters, index + 1, {start: duration})
  return [...result, chapterMeta(chapter, end)]
}

const setActive = playtime => chapter => {
  if (playtime < chapter.start) {
    return Object.assign({}, chapter, {active: false})
  }

  if (playtime >= chapter.end) {
    return Object.assign({}, chapter, {active: false})
  }

  return Object.assign({}, chapter, {active: true})
}

const chapters = (state = [], action) => {
  switch (action.type) {
    case 'SET_META':
      const chapters = get(action.payload, 'chapters', [])
      return chapters.reduce(parseChapters(action.payload.duration), [])
    case 'SET_PLAYTIME':
    case 'UPDATE_PLAYTIME':
      return state.map(setActive(action.payload))
    default:
      return state
  }
}

export {
  chapters
}
