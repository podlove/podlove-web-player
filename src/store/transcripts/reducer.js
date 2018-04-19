import { handleActions } from 'redux-actions'

import {
  SET_TRANSCRIPTS_TIMELINE,
  SET_TRANSCRIPTS_CHAPTERS,
  UPDATE_TRANSCRIPTS,
  TOGGLE_FOLLOW_TRANSCRIPTS,
  SEARCH_TRANSCRIPTS,
  RESET_SEARCH_TRANSCRIPTS,
  SET_SEARCH_TRANSCRIPTS_RESULTS,
  NEXT_SEARCH_RESULT,
  PREVIOUS_SEARCH_RESULT
} from '../types'

export const INITIAL_STATE = {
  timeline: [],
  active: null,
  follow: true,
  hasTranscripts: false,
  search: {
    query: '',
    selected: -1,
    results: []
  }
}

export const reducer = handleActions({
  [SET_TRANSCRIPTS_TIMELINE]: (state, { payload }) => ({
    ...state,
    hasTranscripts: payload.length > 0,
    timeline: payload
  }),

  [SET_TRANSCRIPTS_CHAPTERS]: (state, { payload }) => ({
    ...state,
    timeline: payload
  }),

  [UPDATE_TRANSCRIPTS]: (state, { payload }) => ({
    ...state,
    active: payload
  }),

  [TOGGLE_FOLLOW_TRANSCRIPTS]: (state, { payload }) => ({
    ...state,
    follow: payload
  }),

  [SEARCH_TRANSCRIPTS]: (state, { payload }) => ({
    ...state,
    search: {
      ...state.search,
      query: payload
    }
  }),

  [SET_SEARCH_TRANSCRIPTS_RESULTS]: (state, { payload }) => ({
    ...state,
    search: {
      ...state.search,
      selected: payload.length > 0 ? 0 : -1,
      results: payload
    }
  }),

  [NEXT_SEARCH_RESULT]: (state, { payload }) => ({
    ...state,
    search: {
      ...state.search,
      selected: ((state.search.selected + 1) > (state.search.results.length - 1)) ? (state.search.results.length - 1) : (state.search.selected + 1)
    }
  }),

  [PREVIOUS_SEARCH_RESULT]: (state, { payload }) => ({
    ...state,
    search: {
      ...state.search,
      selected: ((state.search.selected - 1) < 0) ? 0 : (state.search.selected - 1)
    }
  }),

  [RESET_SEARCH_TRANSCRIPTS]: (state, { payload }) => ({
    ...state,
    search: {
      ...state.search,
      results: [],
      selected: -1,
      query: ''
    }
  })
}, INITIAL_STATE)
