import test from 'ava'
import sinon from 'sinon'
import browserEnv from 'browser-env'

import searchEffect from './search'
import { timeline, state } from './fixtures'

browserEnv(['window'])

let store

test.beforeEach(t => {
  window.requestAnimationFrame = cb => cb()

  store = {
    dispatch: sinon.stub(),
    getState: () => state
  }
})

test(`transcripts - search: exports a function`, t => {
  t.is(typeof searchEffect, 'function')
})

test(`transcripts - search: creates an search index on SET_TRANSCRIPTS_TIMELINE`, t => {
  searchEffect(store, {
    type: 'SET_TRANSCRIPTS_TIMELINE',
    payload: timeline
  })

  searchEffect(store, {
    type: 'SEARCH_TRANSCRIPTS',
    payload: 'fooo'
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_SEARCH_TRANSCRIPTS_RESULTS', payload: [ 1 ]
  })
})

test(`transcripts - doesn't dispatch if no results are found`, t => {
  searchEffect(store, {
    type: 'SET_TRANSCRIPTS_TIMELINE',
    payload: timeline
  })

  searchEffect(store, {
    type: 'SEARCH_TRANSCRIPTS',
    payload: 'xyz'
  })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_SEARCH_TRANSCRIPTS_RESULTS', payload: []
  })
})
