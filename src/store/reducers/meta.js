import get from 'lodash/get'

const subtitle = (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.subtitle || state
    default:
      return state
  }
}

const poster = (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.poster || state
    default:
      return state
  }
}

const title = (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.title || state
    default:
      return state
  }
}

const theme = (state = {}, action) => {
  switch (action.type) {
    case 'SET_META':
      return Object.assign({}, state, {
        primary: get(action.payload, ['theme', 'primary'], '#2B8AC6'),
        secondary: get(action.payload, ['theme', 'secondary'], '#fff')
      })
    default:
      return state
  }
}
export {
  poster,
  subtitle,
  title,
  theme
}
