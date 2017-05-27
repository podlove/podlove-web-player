import { get } from 'lodash'

const subtitle = (state = '', action) => {
  switch (action.type) {
    case 'INIT':
      return action.payload.subtitle || null
    default:
      return state
  }
}

const mode = (state = 'native', action) => {
  switch (action.type) {
    case 'INIT':
      return action.payload.mode || state
    default:
      return state
  }
}

const poster = (state = '', action) => {
  switch (action.type) {
    case 'INIT':
      return get(action.payload, 'poster') || get(action.payload, ['show', 'poster']) || null
    default:
      return state
  }
}

const title = (state = '', action) => {
  switch (action.type) {
    case 'INIT':
      return action.payload.title || null
    default:
      return state
  }
}

const showTitle = (state = '', action) => {
  switch (action.type) {
    case 'INIT':
      return get(action.payload, ['show', 'title']) || null
    default:
      return state
  }
}

const reference = (state = {}, action) => {
  switch (action.type) {
    case 'INIT':
      return Object.assign({}, {
        config: get(action.payload, ['reference', 'config'], null),
        share: get(action.payload, ['reference', 'share'], null),
        origin: get(action.payload, ['reference', 'origin'], null)
      })
    default:
      return state
  }
}

const audio = (state = {}, action) => {
  switch (action.type) {
    case 'INIT':
      return get(action.payload, 'audio', [])
    default:
      return state
  }
}

export {
  poster,
  subtitle,
  title,
  showTitle,
  reference,
  mode,
  audio
}
