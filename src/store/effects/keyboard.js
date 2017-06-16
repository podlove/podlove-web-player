import { get } from 'lodash'
import { currentChapter, currentChapterIndex } from 'utils/chapters'

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
  store.dispatch(actions.nextChapter())
}

const previousChapter = store => () => {
  const state = store.getState()
  const chapters = get(state, 'chapters')
  const playtime = get(state, 'playtime')
  const current = currentChapter(chapters)
  const currentIndex = currentChapterIndex(chapters)

  if (playtime - current.start <= 2) {
    store.dispatch(actions.previousChapter())
  } else {
    store.dispatch(actions.setChapter(currentIndex))
  }
}

export default keyhandler => store => {
  keyhandler('right', scrubForward(store), resetModifier)
  keyhandler('left', scrubBackward(store), resetModifier)
  keyhandler('space', playPause(store))
  keyhandler('alt+right', nextChapter(store))
  keyhandler('alt+left', previousChapter(store))
}
