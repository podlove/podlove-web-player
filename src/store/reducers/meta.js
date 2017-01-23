import get from 'lodash/get'
import color from 'color'

const themeColors = (colors = {}) => {
  const primary = get(colors, 'primary', '#2B8AC6')
  const secondary = get(colors, 'secondary')
  const light = '#fff'
  const dark = '#000'
  const grey = '#333'
  const negative = color(primary).dark()

  return {
    player: {
      background: primary,
      poster: light,
      title: secondary ? secondary : negative ? light : dark,
      text: negative ? light : dark,
      actions: negative ? light : dark,
      progress: {
        bar: negative ? light : dark,
        thumb: secondary ? secondary : negative ? light : dark,
        border: primary
      },
      actions: {
        background: secondary ? secondary : negative ? light : dark,
        icon: primary,
      },
      timer: {
        text: negative ? light : dark,
        chapter: secondary ? secondary : negative ? light : dark
      }
    },
    tabs: {
      header: {
        background: primary,
        backgroundActive: light,
        color: negative ? light : dark,
        colorActive: secondary ? secondary : negative ? primary : dark
      },
      body: {
        background: light,
        backgroundActive: secondary ? secondary : primary,
        text: grey,
        textActive: negative ? primary: dark,
        progress: secondary ? secondary : negative ? primary : dark
      }
    }
  }
}

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
      return Object.assign({}, state, themeColors(get(action.payload, 'theme')))
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
