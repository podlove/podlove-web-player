import test from 'ava'
import request from 'superagent'
import nocker from 'superagent-nock'

import fetchEffects from './fetch'
import { transcripts, chapters, contributors, timeline } from './fixtures'

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

test.cb(`transcripts - fetch: parses transcripts on INIT and dispatches SET_TRANSCRIPTS`, t => {
  t.plan(2)

  nock('http://localhost')
    .get('/foo')
    .reply(200, transcripts)

  const tester = ({ type, payload }) => {
    t.is(type, 'SET_TRANSCRIPTS')
    t.deepEqual(payload, timeline)
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

test.cb(`transcripts - fetch: falls back to empty list on INIT and dispatches SET_TRANSCRIPTS`, t => {
  t.plan(2)

  nock('http://localhost')
    .get('/foo')
    .reply(404)

  const tester = ({ type, payload }) => {
    t.is(type, 'SET_TRANSCRIPTS')
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

test.cb(`transcripts - fetch: dispatches an empty list without chapters, when transcripts resolves an empty list`, t => {
  t.plan(2)

  nock('http://localhost')
    .get('/foo')
    .reply(200, [])

  const tester = ({ type, payload }) => {
    t.is(type, 'SET_TRANSCRIPTS')
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
