import test from 'ava'
import { INITIAL_STATE, reducer as transcripts } from './reducer'

test(`transcripts: it is a reducer function`, t => {
  t.is(typeof transcripts, 'function')
})

test(`transcripts: it sets the transcripts on SET_TRANSCRIPTS_TIMELINE`, t => {
  const result = transcripts(INITIAL_STATE, {
    type: 'SET_TRANSCRIPTS_TIMELINE',
    payload: ['foo']
  })

  t.deepEqual(result, {
    ...INITIAL_STATE,
    hasTranscripts: true,
    timeline: ['foo']
  })
})

test(`transcripts: it sets the transcripts on SET_TRANSCRIPTS_CHAPTERS`, t => {
  const result = transcripts(INITIAL_STATE, {
    type: 'SET_TRANSCRIPTS_CHAPTERS',
    payload: ['foo']
  })

  t.deepEqual(result, {
    ...INITIAL_STATE,
    timeline: ['foo']
  })
})

test(`transcripts: it sets the active transcript on UPDATE_TRANSCRIPTS`, t => {
  const result = transcripts(INITIAL_STATE, {
    type: 'UPDATE_TRANSCRIPTS',
    payload: 5
  })

  t.deepEqual(result, {
    ...INITIAL_STATE,
    active: 5
  })
})

test(`transcripts: it sets the follow mode on TOGGLE_FOLLOW_TRANSCRIPTS`, t => {
  const result = transcripts(INITIAL_STATE, {
    type: 'TOGGLE_FOLLOW_TRANSCRIPTS',
    payload: false
  })

  t.deepEqual(result, {
    ...INITIAL_STATE,
    follow: false
  })
})

test(`transcripts: it sets the search query on SEARCH_TRANSCRIPTS`, t => {
  const result = transcripts(INITIAL_STATE, {
    type: 'SEARCH_TRANSCRIPTS',
    payload: 'foo'
  })

  t.deepEqual(result, {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      query: 'foo'
    }
  })
})

test(`transcripts: it sets the search transcripts results on SET_SEARCH_TRANSCRIPTS_RESULTS`, t => {
  const result = transcripts(INITIAL_STATE, {
    type: 'SET_SEARCH_TRANSCRIPTS_RESULTS',
    payload: [1, 2, 3, 4]
  })

  t.deepEqual(result, {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      results: [1, 2, 3, 4],
      selected: 0
    }
  })
})

test(`transcripts: it sets the selected result accordingly if results are empty on SET_SEARCH_TRANSCRIPTS_RESULTS`, t => {
  const result = transcripts(INITIAL_STATE, {
    type: 'SET_SEARCH_TRANSCRIPTS_RESULTS',
    payload: []
  })

  t.deepEqual(result, {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      results: [],
      selected: -1
    }
  })
})

test(`transcripts: it selects the next search result on NEXT_SEARCH_RESULT`, t => {
  const state = {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      query: 'foo',
      selected: 0,
      results: [1, 2, 3, 4]
    }
  }

  const result = transcripts(state, { type: 'NEXT_SEARCH_RESULT' })

  t.deepEqual(result, {
    ...state,
    search: {
      ...state.search,
      selected: 1
    }
  })
})

test(`transcripts: it selects the results length on NEXT_SEARCH_RESULT when selected is greater then results`, t => {
  const state = {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      query: 'foo',
      selected: 3,
      results: [1, 2, 3, 4]
    }
  }

  const result = transcripts(state, { type: 'NEXT_SEARCH_RESULT' })

  t.deepEqual(result, {
    ...state,
    search: {
      ...state.search,
      selected: 3
    }
  })
})

test(`transcripts: it selects the next search result on PREVIOUS_SEARCH_RESULT`, t => {
  const state = {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      query: 'foo',
      selected: 1,
      results: [1, 2, 3, 4]
    }
  }

  const result = transcripts(state, { type: 'PREVIOUS_SEARCH_RESULT' })

  t.deepEqual(result, {
    ...state,
    search: {
      ...state.search,
      selected: 0
    }
  })
})

test(`transcripts: it selects the results length on PREVIOUS_SEARCH_RESULT when selected is lesser then results`, t => {
  const state = {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      query: 'foo',
      selected: 0,
      results: [1, 2, 3, 4]
    }
  }

  const result = transcripts(state, { type: 'PREVIOUS_SEARCH_RESULT' })

  t.deepEqual(result, {
    ...state,
    search: {
      ...state.search,
      selected: 0
    }
  })
})

test(`transcripts: it resets the search on RESET_SEARCH_TRANSCRIPTS`, t => {
  const state = {
    ...INITIAL_STATE,
    search: {
      ...INITIAL_STATE.search,
      query: 'foo',
      selected: 0,
      results: [1, 2, 3, 4]
    }
  }

  const result = transcripts(state, { type: 'RESET_SEARCH_TRANSCRIPTS' })

  t.deepEqual(result, {
    ...state,
    search: {
      ...state.search,
      results: [],
      selected: -1,
      query: ''
    }
  })
})
