import { createAction } from 'redux-actions'

import {
  SET_TRANSCRIPTS,
  UPDATE_TRANSCRIPTS,
  TOGGLE_FOLLOW_TRANSCRIPTS,
  SEARCH_TRANSCRIPTS,
  RESET_SEARCH_TRANSCRIPTS,
  SET_SEARCH_TRANSCRIPTS_RESULTS,
  NEXT_SEARCH_RESULT,
  PREVIOUS_SEARCH_RESULT
} from '../types'

export const setTranscripts = createAction(SET_TRANSCRIPTS, (transcripts = []) => transcripts)
export const updateTranscripts = createAction(UPDATE_TRANSCRIPTS, (playtime = 0) => playtime)
export const followTranscripts = createAction(TOGGLE_FOLLOW_TRANSCRIPTS, (follow = true) => follow)
export const searchTranscripts = createAction(SEARCH_TRANSCRIPTS)
export const resetSearchTranscription = createAction(RESET_SEARCH_TRANSCRIPTS)
export const setTranscriptsSearchResults = createAction(SET_SEARCH_TRANSCRIPTS_RESULTS, (results = []) => results)
export const nextTranscriptsSearchResult = createAction(NEXT_SEARCH_RESULT)
export const previousTranscriptsSearchResult = createAction(PREVIOUS_SEARCH_RESULT)
