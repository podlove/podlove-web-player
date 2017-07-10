import { get } from 'lodash'

const INIT_STATE = {
  title: null,
  subtitle: null,
  summary: null,
  poster: null,
  link: null
}

const episode = (state = INIT_STATE, action) => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        title: get(action.payload, ['title'], null),
        subtitle: get(action.payload, ['subtitle'], null),
        summary: get(action.payload, ['summary'], null),
        link: get(action.payload, ['link'], null),
        poster: get(action.payload, ['poster'], null)
      }
    default:
      return state
  }
}

export {
  episode
}
