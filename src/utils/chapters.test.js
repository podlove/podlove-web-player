import test from 'ava'
import { currentChapter, currentChapterIndex } from './chapters'

test.beforeEach(t => {
  t.context.inactiveChapter = {
    start: '00:00:10',
    title: 'Inactive Chapter',
    active: false
  }

  t.context.activeChapter = {
    start: '01:00:00',
    title: 'Active Chapter',
    active: true
  }
})

test('exports a method called currentChapter', t => {
  t.truthy(typeof currentChapter === 'function')
})

test('exports a method called currentChapterIndex', t => {
  t.truthy(typeof currentChapterIndex === 'function')
})

test('currentChapter should return undefined if no matches', t => {
  t.is(currentChapter([]), undefined)
})

test('currentChapter should find the active chapter in a list', t => {
  t.is(currentChapter([t.context.inactiveChapter, t.context.activeChapter]), t.context.activeChapter)
})

test('currentChapterIndex should return undefined if no matches', t => {
  t.is(currentChapterIndex(null), -1)
})

test('currentChapterIndex should find the active chapter index in a list', t => {
  t.is(currentChapterIndex([t.context.inactiveChapter, t.context.activeChapter]), 1)
})
