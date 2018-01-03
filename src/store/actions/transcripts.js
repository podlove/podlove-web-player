const setTranscripts = (transcripts = []) => ({
  type: 'SET_TRANSCRIPTS',
  payload: transcripts
})

const updateTranscripts = (playtime = 0) => ({
  type: 'UPDATE_TRANSCRIPTS',
  payload: playtime
})

const followTranscripts = (follow = true) => ({
  type: 'TOGGLE_FOLLOW_TRANSCRIPTS',
  payload: follow
})

const searchTranscripts = (query) => ({
  type: 'SEARCH_TRANSCRIPTS',
  payload: query
})

const resetSearchTranscription = () => ({
  type: 'RESET_SEARCH_TRANSCRIPTS'
})

const setTranscriptsSearchResults = (results = []) => ({
  type: 'SET_SEARCH_TRANSCRIPTS_RESULTS',
  payload: results
})

const nextTranscriptsSearchResult = () => ({
  type: 'NEXT_SEARCH_RESULT'
})

const previousTranscriptsSearchResult = () => ({
  type: 'PREVIOUS_SEARCH_RESULT'
})

export {
  setTranscripts,
  updateTranscripts,
  followTranscripts,
  searchTranscripts,
  setTranscriptsSearchResults,
  nextTranscriptsSearchResult,
  previousTranscriptsSearchResult,
  resetSearchTranscription
}
