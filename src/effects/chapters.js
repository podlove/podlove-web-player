import { get, findIndex, isString } from 'lodash'

import { setActiveByPlaytime, setActiveByIndex } from 'utils/chapters'
import { handleActions } from 'utils/effects'
import { toPlayerTime } from 'utils/time'
import request from 'utils/request'

import actions from 'store/actions'

import {
  INIT,
  PREVIOUS_CHAPTER,
  SET_PREVIOUS_CHAPTER,
  NEXT_CHAPTER,
  SET_NEXT_CHAPTER,
  SET_CHAPTER,
  SET_PLAYTIME,
  UPDATE_PLAYTIME,
  DISABLE_GHOST_MODE
} from 'store/types'

import selectors from 'store/selectors'

const parseChapters = duration => (result, chapter, index, chapters) => {
  const end = get(chapters, index + 1, { start: duration })

  return [
    ...result,
    {
      index: index + 1,
      start: toPlayerTime(chapter.start),
      end: toPlayerTime(end.start),
      title: get(chapter, 'title'),
      image: get(chapter, 'image'),
      href: get(chapter, 'href'),
      link_title: get(chapter, 'href') ? new URL(get(chapter, 'href')).hostname.replace(/^(www\.)/,"") : null
    }
  ]
}

const fallbackToLastChapter = (playtime = 0) => (chapters = []) => {
  const index = findIndex(chapters, { active: true })

  return index > -1 || playtime === 0
    ? chapters
    : chapters.map(setActiveByIndex(chapters.length - 1))
}

const chapterUpdate = ({ dispatch }, { payload }) =>
  dispatch(actions.updateChapter(payload))

export default handleActions({
  [INIT]: ({ dispatch }, { payload }, state) => {
    const chapters = get(payload, 'chapters', [])
    const playtime = get(state, 'playtime', 0)
    const duration = get(state, 'duration', 0)

    const requestChapters = isString(chapters)
      ? request(chapters)
      : Promise.resolve(chapters)

    requestChapters
      .catch(() => [])
      .then(chapters => chapters.reduce(parseChapters(duration), []))
      .then(chapters => chapters.map(setActiveByPlaytime(playtime)))
      .then(fallbackToLastChapter(playtime))
      .then(actions.initChapters)
      .then(dispatch)
  },

  [PREVIOUS_CHAPTER]: ({ dispatch }, _, state) => {
    const playtime = get(state, 'playtime', 0)
    const { start, index } = selectors.selectCurrentChapter(state)

    if (playtime - start <= 2) {
      dispatch(actions.setPreviousChapter())
    } else {
      dispatch(actions.setChapter(index - 1))
    }
  },

  [SET_PREVIOUS_CHAPTER]: ({ dispatch }, _, state) => {
    const { start, index } = selectors.selectCurrentChapter(state)

    dispatch(actions.updatePlaytime((index - 1) <= 0 ? 0 : start))
  },

  [NEXT_CHAPTER]: ({ dispatch }, { payload }) => {
    dispatch(actions.setNextChapter(payload))
  },

  [SET_NEXT_CHAPTER]: ({ dispatch }, _, state) => {
    const duration = get(state, 'duration', 0)
    const playtime = get(state, 'playtime', 0)
    const chapters = selectors.selectChapters(state)
    const { start, index } = selectors.selectCurrentChapter(state)

    const chapterStart = index === chapters.length &&
      playtime >= start
      ? duration
      : start

    dispatch(actions.updatePlaytime(chapterStart))
  },

  [SET_CHAPTER]: ({ dispatch }, _, state) => {
    const current = selectors.selectCurrentChapter(state)
    dispatch(actions.updatePlaytime(current.start))
  },

  [SET_PLAYTIME]: chapterUpdate,
  [UPDATE_PLAYTIME]: chapterUpdate,

  // Reset chapters if ghost mode was disabled
  [DISABLE_GHOST_MODE]: ({ dispatch }, _, state) => {
    const playtime = get(state, 'playtime', 0)
    dispatch(actions.updateChapter(playtime))
  }
})
