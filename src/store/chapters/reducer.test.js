import test from 'ava'
import cloneDeep from 'lodash/cloneDeep'
import { reducer as chapters } from './reducer'

let chaptersTestData

let chaptersExpectedResult

test.beforeEach(t => {
  chaptersTestData = [
    { start: '00:00:00', title: 'First Chapter' },
    { start: '01:00:00', title: 'Second Chapter' }
  ]

  chaptersExpectedResult = [
    { start: 0, end: 3600000, title: 'First Chapter' },
    { start: 3600000, end: 7200000, title: 'Second Chapter' }
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

test(`INIT: it initializes the state without playtime`, t => {
  const result = chapters([], {
    type: 'INIT',
    payload: {
      chapters: chaptersTestData,
      duration: '2:00:00'
    }
  })

  chaptersExpectedResult[0].active = true
  chaptersExpectedResult[1].active = false

  t.deepEqual(result, chaptersExpectedResult)
})

test(`INIT: it sets the last chapter active if nothing is active and the playtime is not null`, t => {
  const result = chapters([], {
    type: 'INIT',
    payload: {
      chapters: chaptersTestData,
      duration: '2:00:00',
      playtime: 7200000
    }
  })

  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  t.deepEqual(result, chaptersExpectedResult)
})

test(`INIT: it initializes the state with playtime`, t => {
  const result = chapters([], {
    type: 'INIT',
    payload: {
      chapters: chaptersTestData,
      duration: '2:00:00',
      playtime: 3601000
    }
  })

  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  t.deepEqual(result, chaptersExpectedResult)
})

test(`UPDATE_CHAPTER: it sets a chapter active depending on the current duration`, t => {
  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  const result = chapters(chaptersExpectedResult, {
    type: 'UPDATE_CHAPTER',
    payload: 10
  })

  const expected = cloneDeep(chaptersExpectedResult)

  expected[0].active = true
  expected[1].active = false

  t.deepEqual(result, expected)
})

test(`UPDATE_CHAPTER: it sets a chapter active depending on the current duration`, t => {
  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  const result = chapters(chaptersExpectedResult, {
    type: 'UPDATE_CHAPTER',
    payload: 10
  })

  const expected = cloneDeep(chaptersExpectedResult)

  expected[0].active = true
  expected[1].active = false

  t.deepEqual(result, expected)
})

test(`UPDATE_CHAPTER: returns the state if no active chapter was found`, t => {
  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  const result = chapters(chaptersExpectedResult, {
    type: 'UPDATE_CHAPTER',
    payload: 7300000
  })

  const expected = cloneDeep(chaptersExpectedResult)

  t.deepEqual(result, expected)
})

test(`NEXT_CHAPTER: it sets the next chapter active`, t => {
  chaptersExpectedResult[0].active = true
  chaptersExpectedResult[1].active = false

  let result = chapters(chaptersExpectedResult, {
    type: 'NEXT_CHAPTER'
  })

  let expected = cloneDeep(chaptersExpectedResult)
  expected[0].active = false
  expected[1].active = true

  t.deepEqual(result, expected)

  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  result = chapters(chaptersExpectedResult, {
    type: 'NEXT_CHAPTER'
  })

  expected = cloneDeep(chaptersExpectedResult)
  expected[0].active = false
  expected[1].active = true

  t.deepEqual(result, expected)
})

test(`PREVIOUS_CHAPTER: it sets the previous chapter active`, t => {
  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  let result = chapters(chaptersExpectedResult, {
    type: 'PREVIOUS_CHAPTER'
  })

  let expected = cloneDeep(chaptersExpectedResult)
  expected[0].active = true
  expected[1].active = false

  t.deepEqual(result, expected)

  chaptersExpectedResult[0].active = true
  chaptersExpectedResult[1].active = false

  result = chapters(chaptersExpectedResult, {
    type: 'PREVIOUS_CHAPTER'
  })

  expected = cloneDeep(chaptersExpectedResult)
  expected[0].active = true
  expected[1].active = false

  t.deepEqual(result, expected)
})

test(`SET_CHAPTER: it sets a chapter with a specific index active`, t => {
  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  let result = chapters(chaptersExpectedResult, {
    type: 'SET_CHAPTER',
    payload: 0
  })

  let expected = cloneDeep(chaptersExpectedResult)
  expected[0].active = true
  expected[1].active = false

  t.deepEqual(result, expected)
})
