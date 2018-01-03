import test from 'ava'
import {
  setTranscripts,
  updateTranscripts,
  followTranscripts,
  searchTranscripts,
  setTranscriptsSearchResults,
  nextTranscriptsSearchResult,
  previousTranscriptsSearchResult,
  resetSearchTranscription
} from './transcripts'

test(`setTranscripts: creates the SET_TRANSCRIPTS action`, t => {
  t.deepEqual(setTranscripts('foo'), {
    type: 'SET_TRANSCRIPTS',
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
