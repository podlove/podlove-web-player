import test from 'ava'
import request from 'superagent'
import nocker from 'superagent-nock'

import fetchEffects from './fetch'
import { transcripts, chapters, contributors, parsedTranscripts, parsedTranscriptsWithSpeakers, parsedChapters } from './fixtures'

let nock, payload

test.beforeEach(t => {
  nock = nocker(request)

  payload = {
    contributors,
    chapters,
    transcripts: 'http://localhost/foo'
  }
})

test(`transcripts - fetch: exports a function`, t => {
  t.is(typeof fetchEffects, 'function')
})

test.cb(`transcripts - fetch: parses transcripts on INIT and dispatches INIT_TRANSCRIPTS`, t => {
  t.plan(2)

  nock('http://localhost')
    .get('/foo')
    .reply(200, transcripts)

  const tester = ({ type, payload }) => {
    t.is(type, 'INIT_TRANSCRIPTS')
    t.deepEqual(payload, parsedTranscripts)
    t.end()
  }

  fetchEffects({
    getState: () => ({}),
    dispatch: tester
  }, {
    type: 'INIT',
    payload
  })
})

test.cb(`transcripts - fetch: falls back to empty list on INIT and dispatches INIT_TRANSCRIPTS`, t => {
  t.plan(2)

  nock('http://localhost')
    .get('/foo')
    .reply(404)

  const tester = ({ type, payload }) => {
    t.is(type, 'INIT_TRANSCRIPTS')
    t.deepEqual(payload, [])
    t.end()
  }

  fetchEffects({
    getState: () => ({}),
    dispatch: tester
  }, {
    type: 'INIT',
    payload
  })
})

test.cb(`transcripts - fetch: it transforms transcripts on INIT_TRANSCRIPTS and dispatches SET_TRANSCRIPTS_TIMELINE`, t => {
  t.plan(2)

  const tester = ({ type, payload }) => {
    t.is(type, 'SET_TRANSCRIPTS_TIMELINE')
    t.deepEqual(payload, parsedTranscriptsWithSpeakers)
    t.end()
  }

  fetchEffects({
    dispatch: tester,
    getState: () => ({
      transcripts: {
        timeline: []
      },
      speakers: contributors
    })
  }, {
    type: 'INIT_TRANSCRIPTS',
    payload: parsedTranscripts
  })
})

test.cb(`transcripts - fetch: it transforms chapters on INIT_CHAPTERS and dispatches SET_TRANSCRIPTS_CHAPTERS`, t => {
  t.plan(2)

  const tester = ({ type, payload }) => {
    t.is(type, 'SET_TRANSCRIPTS_CHAPTERS')
    t.deepEqual(payload, parsedChapters)
    t.end()
  }

  fetchEffects({
    dispatch: tester,
    getState: () => ({
      transcripts: {
        timeline: []
      }
    })
  }, {
    type: 'INIT_CHAPTERS',
    payload: chapters
  })
})
