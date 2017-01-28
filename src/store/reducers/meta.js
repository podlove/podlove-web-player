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

export {
  poster,
  subtitle,
  title
}
