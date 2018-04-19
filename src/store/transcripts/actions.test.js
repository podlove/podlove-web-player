import test from 'ava'
import {
  setTranscriptsTimeline,
  setTranscriptsChapters,
  updateTranscripts,
  followTranscripts,
  searchTranscripts,
  setTranscriptsSearchResults,
  nextTranscriptsSearchResult,
  previousTranscriptsSearchResult,
  resetSearchTranscription
} from './actions'

test(`setTranscriptsTimeline: creates the SET_TRANSCRIPTS_TIMELINE action`, t => {
  t.deepEqual(setTranscriptsTimeline('foo'), {
    type: 'SET_TRANSCRIPTS_TIMELINE',
    payload: 'foo'
  })
})

test(`setTranscriptsChapters: creates the SET_TRANSCRIPTS_CHAPTERS action`, t => {
  t.deepEqual(setTranscriptsChapters('foo'), {
    type: 'SET_TRANSCRIPTS_CHAPTERS',
    payload: 'foo'
  })
})

test(`setTranscripts: creates the UPDATE_TRANSCRIPTS action`, t => {
  t.deepEqual(updateTranscripts(5), {
    type: 'UPDATE_TRANSCRIPTS',
    payload: 5
  })
})

test(`setTranscripts: creates the TOGGLE_FOLLOW_TRANSCRIPTS action`, t => {
  t.deepEqual(followTranscripts(true), {
    type: 'TOGGLE_FOLLOW_TRANSCRIPTS',
    payload: true
  })
})

test(`searchTranscripts: creates the SEARCH_TRANSCRIPTS action`, t => {
  t.deepEqual(searchTranscripts('bar'), {
    type: 'SEARCH_TRANSCRIPTS',
    payload: 'bar'
  })
})

test(`setTranscriptsSearchResults: creates the SET_SEARCH_TRANSCRIPTS_RESULTS action`, t => {
  t.deepEqual(setTranscriptsSearchResults([1]), {
    type: 'SET_SEARCH_TRANSCRIPTS_RESULTS',
    payload: [1]
  })
})

test(`nextTranscriptsSearchResult: creates the NEXT_SEARCH_RESULT action`, t => {
  t.deepEqual(nextTranscriptsSearchResult(), {
    type: 'NEXT_SEARCH_RESULT'
  })
})

test(`previousTranscriptsSearchResult: creates the PREVIOUS_SEARCH_RESULT action`, t => {
  t.deepEqual(previousTranscriptsSearchResult(), {
    type: 'PREVIOUS_SEARCH_RESULT'
  })
})

test(`resetSearchTranscription: creates the RESET_SEARCH_TRANSCRIPTS action`, t => {
  t.deepEqual(resetSearchTranscription(), {
    type: 'RESET_SEARCH_TRANSCRIPTS'
  })
})
