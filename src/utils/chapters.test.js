import test from 'ava'
import { currentChapter, currentChapterIndex, nextChapterPlaytime, previousChapterPlaytime } from './chapters'

test.beforeEach(t => {
  t.context.inactiveChapter = {
    start: 10,
    title: 'Inactive Chapter',
    active: false
  }

  t.context.activeChapter = {
    start: 3600,
    title: 'Active Chapter',
    active: true
  }

  t.context.additionalChapter = {
    start: 7200,
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

test('exports a method called nextChapterPlaytime', t => {
  t.is(typeof nextChapterPlaytime, 'function')
})

test('exports a method called previousChapterPlaytime', t => {
  t.is(typeof previousChapterPlaytime, 'function')
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

test(`nextChapterPlaytime returns null if no chapter is active`, t => {
  t.is(nextChapterPlaytime([t.context.inactiveChapter, t.context.additionalChapter]), null)
})

test(`nextChapterPlaytime returns the start time of the next chapter`, t => {
  t.is(nextChapterPlaytime([t.context.inactiveChapter, t.context.activeChapter, t.context.additionalChapter]), 7200)
})

test(`nextChapterPlaytime returns null if last chapter`, t => {
  t.is(nextChapterPlaytime([t.context.inactiveChapter, t.context.activeChapter]), null)
})

test(`previousChapterPlaytime returns start time of first chapter if no active`, t => {
  t.is(previousChapterPlaytime([t.context.inactiveChapter, t.context.additionalChapter]), 10)
})

test(`previousChapterPlaytime returns the start time of the previous chapter`, t => {
  t.is(previousChapterPlaytime([t.context.inactiveChapter, t.context.activeChapter, t.context.additionalChapter], 3700), 3600)
})

test(`previousChapterPlaytime returns current chapter playtime if in range of the current chapter`, t => {
  t.is(previousChapterPlaytime([t.context.inactiveChapter, t.context.activeChapter], 3600), 10)
})
