import test from 'ava'
import cloneDeep from 'lodash/cloneDeep'
import {chapters} from './chapters'

let chaptersTestData

let chaptersExpectedResult

test.beforeEach(t => {
  chaptersTestData = [
    {start: '00:00:00', title: 'First Chapter'},
    {start: '01:00:00', title: 'Second Chapter'}
  ]

  chaptersExpectedResult = [
    { start: 0, end: 3600, title: 'First Chapter' },
    { start: 3600, end: 7200, title: 'Second Chapter' }
  ]
})

test(`it exports a reducer function`, t => {
  t.truthy(typeof chapters === 'function')
})

test(`INIT: it initializes the state without playtime`, t => {
  const result = chapters([], {
    type: 'INIT',
    payload: {
      chapters: chaptersTestData,
      duration: 7200
    }
  })

  chaptersExpectedResult[0].active = true
  chaptersExpectedResult[1].active = false

  t.deepEqual(result, chaptersExpectedResult)
})

test(`INIT: it initializes the state with playtime`, t => {
  const result = chapters([], {
    type: 'INIT',
    payload: {
      chapters: chaptersTestData,
      duration: 7200,
      playtime: 3601
    }
  })

  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  t.deepEqual(result, chaptersExpectedResult)
})

test(`SET_PLAYTIME: it sets a chapter active depending on the current duration`, t => {
  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  const result = chapters(chaptersExpectedResult, {
    type: 'SET_PLAYTIME',
    payload: 10
  })

  const expected = cloneDeep(chaptersExpectedResult)

  expected[0].active = true
  expected[1].active = false

  t.deepEqual(result, expected)
})

test(`UPDATE_PLAYTIME: it sets a chapter active depending on the current duration`, t => {
  chaptersExpectedResult[0].active = false
  chaptersExpectedResult[1].active = true

  const result = chapters(chaptersExpectedResult, {
    type: 'UPDATE_PLAYTIME',
    payload: 10
  })

  const expected = cloneDeep(chaptersExpectedResult)

  expected[0].active = true
  expected[1].active = false

  t.deepEqual(result, expected)
})

test(`it ignores any other action types`, t => {
  const result = chapters('foobar', {
    type: 'NOT_A_REAL_ACTION',
    payload: 10
  })

  t.is(result, 'foobar')
})
