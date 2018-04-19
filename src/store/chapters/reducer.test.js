import test from 'ava'
import cloneDeep from 'lodash/cloneDeep'
import { reducer as chapters } from './reducer'

let chaptersTestData

test.beforeEach(t => {
  chaptersTestData = [
    { start: 0, end: 3600000, title: 'First Chapter' },
    { start: 3600000, end: 7200000, title: 'Second Chapter' },
    { start: 7200000, end: 14400000, title: 'Third Chapter' }
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

  t.deepEqual(result, chaptersTestData)
})

test(`UPDATE_CHAPTER: it sets a chapter active depending on the current duration`, t => {
  chaptersTestData[0].active = false
  chaptersTestData[1].active = true

  const result = chapters(chaptersTestData, {
    type: 'UPDATE_CHAPTER',
    payload: 10
  })

  const expected = cloneDeep(chaptersTestData)

  expected[0].active = true
  expected[1].active = false
  expected[2].active = false

  t.deepEqual(result, expected)
})

test(`UPDATE_CHAPTER: it sets a chapter active depending on the current duration`, t => {
  chaptersTestData[0].active = false
  chaptersTestData[1].active = true
  chaptersTestData[2].active = false

  const result = chapters(chaptersTestData, {
    type: 'UPDATE_CHAPTER',
    payload: 10
  })

  const expected = cloneDeep(chaptersTestData)

  expected[0].active = true
  expected[1].active = false
  expected[2].active = false

  t.deepEqual(result, expected)
})

test(`UPDATE_CHAPTER: returns the state if no active chapter was found`, t => {
  chaptersTestData[0].active = false
  chaptersTestData[1].active = false
  chaptersTestData[2].active = false

  const result = chapters(chaptersTestData, {
    type: 'UPDATE_CHAPTER',
    payload: 14400000
  })

  const expected = cloneDeep(chaptersTestData)

  t.deepEqual(result, expected)
})

test(`NEXT_CHAPTER: it sets the next chapter active`, t => {
  chaptersTestData[0].active = true
  chaptersTestData[1].active = false
  chaptersTestData[2].active = false

  let result = chapters(chaptersTestData, {
    type: 'NEXT_CHAPTER'
  })

  let expected = cloneDeep(chaptersTestData)
  expected[0].active = false
  expected[1].active = true
  expected[2].active = false

  t.deepEqual(result, expected)

  chaptersTestData[0].active = false
  chaptersTestData[1].active = true
  chaptersTestData[2].active = false

  result = chapters(chaptersTestData, {
    type: 'NEXT_CHAPTER'
  })

  expected = cloneDeep(chaptersTestData)
  expected[0].active = false
  expected[1].active = false
  expected[2].active = true

  t.deepEqual(result, expected)
})

test(`PREVIOUS_CHAPTER: it sets the previous chapter active`, t => {
  chaptersTestData[0].active = false
  chaptersTestData[1].active = true
  chaptersTestData[2].active = false

  let result = chapters(chaptersTestData, {
    type: 'PREVIOUS_CHAPTER'
  })

  let expected = cloneDeep(chaptersTestData)
  expected[0].active = true
  expected[1].active = false
  expected[2].active = false

  t.deepEqual(result, expected)

  chaptersTestData[0].active = true
  chaptersTestData[1].active = false
  chaptersTestData[2].active = false

  result = chapters(chaptersTestData, {
    type: 'PREVIOUS_CHAPTER'
  })

  expected = cloneDeep(chaptersTestData)
  expected[0].active = true
  expected[1].active = false
  expected[2].active = false

  t.deepEqual(result, expected)
})

test(`PREVIOUS_CHAPTER: falls back to 0 if no active chapter was found`, t => {
  chaptersTestData[0].active = false
  chaptersTestData[1].active = false
  chaptersTestData[2].active = false

  let result = chapters(chaptersTestData, {
    type: 'PREVIOUS_CHAPTER'
  })

  let expected = cloneDeep(chaptersTestData)
  expected[0].active = true
  expected[1].active = false
  expected[2].active = false

  t.deepEqual(result, expected)
})

test(`NEXT_CHAPTER: falls back to chapters length if no active chapter was found`, t => {
  chaptersTestData[0].active = false
  chaptersTestData[1].active = false
  chaptersTestData[2].active = true

  let result = chapters(chaptersTestData, {
    type: 'NEXT_CHAPTER'
  })

  let expected = cloneDeep(chaptersTestData)
  expected[0].active = false
  expected[1].active = false
  expected[2].active = true

  t.deepEqual(result, expected)
})

test(`SET_CHAPTER: it sets a chapter with a specific index active`, t => {
  chaptersTestData[0].active = false
  chaptersTestData[1].active = true
  chaptersTestData[2].active = false

  let result = chapters(chaptersTestData, {
    type: 'SET_CHAPTER',
    payload: 0
  })

  let expected = cloneDeep(chaptersTestData)
  expected[0].active = true
  expected[1].active = false
  expected[2].active = false

  t.deepEqual(result, expected)
})
