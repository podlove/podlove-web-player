import { get } from 'lodash'
import { currentChapter, currentChapterIndex } from 'utils/chapters'
import actions from '../actions'

export default (store, action) => {
  const state = store.getState()
  const chapters = get(state, 'chapters', [])
  const ghost = get(state, 'ghost', {})
  const current = currentChapter(chapters)
  const currentIndex = currentChapterIndex(chapters)

  switch (action.type) {
    case 'PREVIOUS_CHAPTER':
      if (currentIndex === 0) {
        store.dispatch(actions.updatePlaytime(0))
      } else {
        store.dispatch(actions.updatePlaytime(current.start))
      }
      break
    case 'NEXT_CHAPTER':
      if (currentIndex === chapters.length - 1 && state.playtime >= current.start) {
        store.dispatch(actions.updatePlaytime(state.duration))
      } else {
        store.dispatch(actions.updatePlaytime(current.start))
      }
      break
    case 'SET_CHAPTER':
      store.dispatch(actions.updatePlaytime(current.start))
      break
    case 'SET_PLAYTIME':
    case 'UPDATE_PLAYTIME':
      if (!ghost.active) {
        store.dispatch(actions.updateChapter(action.payload))
      }
      break
  }
}
