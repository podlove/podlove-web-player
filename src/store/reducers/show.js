import { get } from 'lodash'

const INIT_STATE = {
  title: null,
  subtitle: null,
  summary: null,
  poster: null,
  link: null
}

const show = (state = INIT_STATE, action) => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        title: get(action.payload, ['show', 'title'], null),
        subtitle: get(action.payload, ['show', 'subtitle'], null),
        summary: get(action.payload, ['show', 'summary'], null),
        link: get(action.payload, ['show', 'link'], null),
        poster: get(action.payload, ['show', 'poster'], null)
      }
    default:
      return state
  }
}

export {
  show
}
