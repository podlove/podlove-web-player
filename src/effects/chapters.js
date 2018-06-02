import { get, findIndex, isString } from 'lodash'
import { getOr, compose } from 'lodash/fp'

import { currentChapter, currentChapterIndex, setActiveByPlaytime, setActiveByIndex } from 'utils/chapters'
import { handleActions } from 'utils/effects'
import { toPlayerTime } from 'utils/time'
import request from 'utils/request'

import actions from 'store/actions'

import { INIT, PREVIOUS_CHAPTER, NEXT_CHAPTER, SET_CHAPTER, SET_PLAYTIME, UPDATE_PLAYTIME } from 'store/types'

const parseChapters = duration => (result, chapter, index, chapters) => {
  const end = get(chapters, index + 1, { start: duration })

  return [...result, {
    index: index + 1,
    start: toPlayerTime(chapter.start),
    end: toPlayerTime(end.start),
    title: chapter.title
  }]
}

const fallbackToLastChapter = (playtime = 0) => (chapters = []) => {
  const index = findIndex(chapters, { active: true })

  return (index > -1 || playtime === 0) ? chapters : chapters.map(setActiveByIndex(chapters.length - 1))
}

const chapterIndexFromState = compose(
  currentChapterIndex,
  getOr([], 'chapters')
)

const currentChapterFromState = compose(
  currentChapter,
  getOr([], 'chapters')
)

const chapterUpdate = ({ dispatch }, { payload }, state) => {
  const ghost = get(state, 'ghost', {})

  !ghost.active && dispatch(actions.updateChapter(payload))
}

export default handleActions({
  [INIT]: ({ dispatch }, { payload }, state) => {
    const chapters = get(payload, 'chapters', [])
    const playtime = get(state, 'playtime', 0)
    const duration = get(state, 'duration', 0)

    const requestChapters = isString(chapters) ? request(chapters) : Promise.resolve(chapters)

    requestChapters
      .catch(() => [])
      .then(chapters => chapters.reduce(parseChapters(duration), []))
      .then(chapters => chapters.map(setActiveByPlaytime(playtime)))
      .then(fallbackToLastChapter(playtime))
      .then(actions.initChapters)
      .then(dispatch)
  },

  [PREVIOUS_CHAPTER]: ({ dispatch }, action, state) => {
    const index = chapterIndexFromState(state)
    const current = currentChapterFromState(state)

    dispatch(actions.updatePlaytime(index === 0 ? 0 : current.start))
  },

  [NEXT_CHAPTER]: ({ dispatch }, action, state) => {
    const index = chapterIndexFromState(state)
    const duration = get(state, 'duration', 0)
    const playtime = get(state, 'playtime', 0)
    const chapters = get(state, 'chapters', [])
    const current = currentChapterFromState(state)

    const chapterStart = (index === chapters.length - 1 && playtime >= current.start) ? duration : current.start

    dispatch(actions.updatePlaytime(chapterStart))
  },

  [SET_CHAPTER]: ({ dispatch }, action, state) => {
    const current = currentChapterFromState(state)
    dispatch(actions.updatePlaytime(current.start))
  },

  [SET_PLAYTIME]: chapterUpdate,
  [UPDATE_PLAYTIME]: chapterUpdate
})
