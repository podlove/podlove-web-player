import get from 'lodash/get'
import { nextChapterPlaytime, previousChapterPlaytime } from 'utils/chapters'

import actions from '../actions'

let modifier = 0

const calcModifier = () => {
  modifier = modifier < 7 ? modifier + 0.25 : 7
  return modifier
}

const resetModifier = () => {
  modifier = 0
}

const scrubForward = store => () => {
  const state = store.getState()
  const playtime = get(state, 'playtime')
  const duration = get(state, 'duration')
  let time = playtime + Math.pow(2, calcModifier())

  time = time > duration ? duration : time

  store.dispatch(actions.updatePlaytime(time))
}

const scrubBackward = store => () => {
  const state = store.getState()
  const playtime = get(state, 'playtime')
  let time = playtime - Math.pow(2, calcModifier())

  time = time > 0 ? time : 0

  store.dispatch(actions.updatePlaytime(time))
}

const playPause = store => () => {
  const playstate = get(store.getState(), 'playstate')

  if (playstate === 'playing') {
    store.dispatch(actions.pause())
  } else {
    store.dispatch(actions.play())
  }
}

const nextChapter = store => () => {
  const state = store.getState()
  const chapters = get(state, 'chapters')
  const duration = get(state, 'duration')
  const nextChapter = nextChapterPlaytime(chapters) || duration

  store.dispatch(actions.updatePlaytime(nextChapter))
}

const previousChapter = store => () => {
  const state = store.getState()
  const chapters = get(state, 'chapters')
  const playtime = get(state, 'playtime')
  const previousChapter = previousChapterPlaytime(chapters, playtime) || 0

  store.dispatch(actions.updatePlaytime(previousChapter))
}

export default keyhandler => store => {
  keyhandler('right', scrubForward(store), resetModifier)
  keyhandler('left', scrubBackward(store), resetModifier)
  keyhandler('space', playPause(store))
  keyhandler('alt+right', nextChapter(store))
  keyhandler('alt+left', previousChapter(store))
}
