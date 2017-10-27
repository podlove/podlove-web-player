import test from 'ava'
import { currentChapter, currentChapterIndex, currentChapterByPlaytime } from './chapters'

test.beforeEach(t => {
  t.context.inactiveChapter = {
    start: 0,
    end: 3600,
    title: 'Inactive Chapter',
    active: false
  }

  t.context.activeChapter = {
    start: 3600,
    end: 7200,
    title: 'Active Chapter',
    active: true
  }

  t.context.additionalChapter = {
    start: 7200,
    end: 9000,
    title: 'Additional Chapter',
    active: false
  }
})

test('exports a method called currentChapter', t => {
  t.is(typeof currentChapter, 'function')
})

test('exports a method called currentChapterIndex', t => {
  t.is(typeof currentChapterIndex, 'function')
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

test('currentChapterByPlaytime should find the active chapter by playtime', t => {
  t.is(currentChapterByPlaytime([t.context.inactiveChapter, t.context.activeChapter, t.context.additionalChapter])(11), t.context.inactiveChapter)
  t.is(currentChapterByPlaytime([t.context.inactiveChapter, t.context.activeChapter, t.context.additionalChapter])(4000), t.context.activeChapter)
  t.is(currentChapterByPlaytime([t.context.activeChapter, t.context.additionalChapter, t.context.inactiveChapter])(3500), t.context.inactiveChapter)
})
