export const INITIAL_STATE = {
  timeline: [],
  active: null,
  follow: true,
  search: {
    query: '',
    selected: -1,
    results: []
  }
}

export const transcripts = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case 'SET_TRANSCRIPTS':
      return {
        ...state,
        timeline: payload
      }
    case 'UPDATE_TRANSCRIPTS':
      return {
        ...state,
        active: payload
      }
    case 'TOGGLE_FOLLOW_TRANSCRIPTS':
      return {
        ...state,
        follow: payload
      }
    case 'SEARCH_TRANSCRIPTS':
      return {
        ...state,
        search: {
          ...state.search,
          query: payload
        }
      }
    case 'SET_SEARCH_TRANSCRIPTS_RESULTS':
      return {
        ...state,
        search: {
          ...state.search,
          selected: payload.length > 0 ? 0 : -1,
          results: payload
        }
      }
    case 'NEXT_SEARCH_RESULT':
      return {
        ...state,
        search: {
          ...state.search,
          selected: ((state.search.selected + 1) > (state.search.results.length - 1)) ? (state.search.results.length - 1) : (state.search.selected + 1)
        }
      }
    case 'PREVIOUS_SEARCH_RESULT':
      return {
        ...state,
        search: {
          ...state.search,
          selected: ((state.search.selected - 1) < 0) ? 0 : (state.search.selected - 1)
        }
      }
    case 'RESET_SEARCH_TRANSCRIPTS':
      return {
        ...state,
        search: {
          ...state.search,
          results: [],
          selected: -1,
          query: ''
        }
      }
    default:
      return state
  }
}
