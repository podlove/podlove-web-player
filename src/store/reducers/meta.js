const subtitle = (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.subtitle
    default:
      return state
  }
}

const poster = (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.poster
    default:
      return state
  }
}

const title = (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.title
    default:
      return state
  }
}

const mode = (state = '', action) => {
  switch (action.type) {
    case 'SET_META':
      return action.payload.mode
    default:
      return state
  }
}

export {
  poster,
  subtitle,
  title,
  // mode
}
