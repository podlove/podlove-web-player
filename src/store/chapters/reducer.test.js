import test from 'ava'
import { reducer as chapters } from './reducer'

let chaptersTestData

const generateTestData = (chapters, active) => {
  const fallback = {
    start: null,
    end: null,
    href: null,
    title: null,
    index: -1
  }

  const activeIndex = active - 1
  let list = chapters

  if (activeIndex > -1) {
    list = chapters.map(chapter => ({
      ...chapter,
      active: chapter.index === active
    }))
  }

  let current = list[activeIndex] ? list[activeIndex] : fallback
  let next = list[activeIndex + 1] ? list[activeIndex + 1] : fallback
  let previous = list[activeIndex - 1] ? list[activeIndex - 1] : fallback

  if (activeIndex < 0) {
    next = list[0]
  }

  return {
    list,
    current,
    next,
    previous
  }
}

test.beforeEach(t => {
  chaptersTestData = [
    { start: 0, end: 3600000, title: 'First Chapter', index: 1 },
    { start: 3600000, end: 7200000, title: 'Second Chapter', index: 2 },
    { start: 7200000, end: 14400000, title: 'Third Chapter', index: 3 }
  ]
})

test(`it exports a reducer function`, t => {
  t.truthy(typeof chapters === 'function')
})

test(`it ignores any other action types`, t => {
  const result = chapters('foobar', {
    type: 'NOT_A_REAL_ACTION',
    payload: 10
  })

  t.is(result, 'foobar')
})

test(`INIT_CHAPTERS: it initializes the state without playtime`, t => {
  const result = chapters([], {
    type: 'INIT_CHAPTERS',
    payload: chaptersTestData
  })

  t.deepEqual(result, generateTestData(chaptersTestData, -1))
})

test(`UPDATE_CHAPTER: it sets a chapter active depending on the current playtime`, t => {
  const result = chapters(generateTestData(chaptersTestData, 2), {
    type: 'UPDATE_CHAPTER',
    payload: 10
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 1))
})

test(`UPDATE_CHAPTER: returns the state if no active chapter was found`, t => {
  const result = chapters(generateTestData(chaptersTestData, 1), {
    type: 'UPDATE_CHAPTER',
    payload: 14400000
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 1))
})

test(`SET_NEXT_CHAPTER: it sets the next chapter active`, t => {
  let result = chapters(generateTestData(chaptersTestData, 1), {
    type: 'SET_NEXT_CHAPTER'
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 2))

  result = chapters(generateTestData(chaptersTestData, 3), {
    type: 'SET_NEXT_CHAPTER'
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 3))
})

test(`PREVIOUS_CHAPTER: it sets the previous chapter active`, t => {
  let result = chapters(generateTestData(chaptersTestData, 2), {
    type: 'SET_PREVIOUS_CHAPTER'
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 1))

  result = chapters(generateTestData(chaptersTestData, 1), {
    type: 'SET_PREVIOUS_CHAPTER'
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 1))
})

test(`SET_PREVIOUS_CHAPTER: falls back to first chapter if no active chapter was found`, t => {
  let result = chapters(generateTestData(chaptersTestData, -1), {
    type: 'SET_PREVIOUS_CHAPTER'
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 1))
})

test(`SET_CHAPTER: it sets a chapter with a specific index active`, t => {
  let result = chapters(generateTestData(chaptersTestData, 3), {
    type: 'SET_CHAPTER',
    payload: 0
  })

  t.deepEqual(result, generateTestData(chaptersTestData, 1))
})
