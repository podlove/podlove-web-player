import test from 'ava'
import { setChapter, nextChapter, previousChapter } from './chapters'

test(`nextChapter: creates the NEXT_CHAPTER action`, t => {
  t.deepEqual(nextChapter(), {
    type: 'NEXT_CHAPTER'
  })
})

test(`previousChapter: creates the PREVIOUS_CHAPTER action`, t => {
  t.deepEqual(previousChapter(), {
    type: 'PREVIOUS_CHAPTER'
  })
})

test(`setChapter: creates the SET_CHAPTER action`, t => {
  t.deepEqual(setChapter(1), {
    type: 'SET_CHAPTER',
    payload: 1
  })
})
