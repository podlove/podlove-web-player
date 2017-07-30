import { get } from 'lodash'

const INIT_STATE = {
  title: null,
  subtitle: null,
  summary: null,
  poster: null,
  link: null,
  publicationDate: null
}

const parseDate = (utcDate) => {
  if (!utcDate) {
    return null
  }

  const date = new Date(utcDate)

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear()
  }
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
        poster: get(action.payload, ['poster'], null),
        publicationDate: parseDate(get(action.payload, ['publicationDate'], null))
      }
    default:
      return state
  }
}

export {
  episode
}
