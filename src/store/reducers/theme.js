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
      title: secondary || negative ? light : dark,
      text: negative ? light : dark,
      progress: {
        bar: negative ? light : dark,
        thumb: secondary || negative ? light : dark,
        border: primary,
        seperator: primary
      },
      actions: {
        background: secondary || negative ? light : dark,
        icon: primary
      },
      timer: {
        text: negative ? light : dark,
        chapter: secondary || negative ? light : dark
      }
    },
    tabs: {
      header: {
        background: primary,
        backgroundActive: light,
        color: negative ? light : dark,
        colorActive: secondary || negative ? primary : dark
      },
      body: {
        background: light,
        backgroundActive: secondary || primary,
        text: grey,
        textActive: negative ? primary : dark,
        progress: secondary || negative ? primary : dark
      },
      slider: {
        thumb: primary
      },
      button: {
        background: primary,
        text: negative ? light : dark
      },
      input: {
        border: negative ? primary : dark
      }
    },
    overlay: {
      button: negative ? light : dark
    }
  }
}

const theme = (state = {}, action) => {
  switch (action.type) {
    case 'INIT':
      return Object.assign({}, state, themeColors(get(action.payload, 'theme')))
    case 'SET_THEME':
      return Object.assign({}, state, themeColors(action.payload))
    default:
      return state
  }
}

export {
  theme
}
