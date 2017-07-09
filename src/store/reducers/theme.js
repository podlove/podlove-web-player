import get from 'lodash/get'
import color from 'color'

const themeColors = (colors = {}) => {
  const main = get(colors, 'main', '#2B8AC6')
  const highlight = get(colors, 'highlight')

  const light = '#fff'
  const dark = '#000'
  const grey = '#333'

  const luminosity = color(main).luminosity()
  const negative = luminosity < 0.25

  const fallbackColor = (first, second) => {
    if (first) {
      return first
    }

    return second
  }

  return {
    player: {
      background: main,
      poster: negative ? light : dark,
      title: fallbackColor(highlight, negative ? light : dark),
      text: negative ? light : dark,
      progress: {
        bar: negative ? light : dark,
        thumb: fallbackColor(highlight, negative ? light : dark),
        border: main,
        seperator: main,
        track: negative ? light : dark,
        buffer: color(main).fade(0.5),
        range: luminosity < 0.05 ? color(light).fade(0.25) : color(dark).fade(0.75)
      },
      actions: {
        background: fallbackColor(highlight, negative ? light : dark),
        icon: main
      },
      timer: {
        text: negative ? light : dark,
        chapter: fallbackColor(highlight, negative ? light : dark)
      }
    },
    tabs: {
      header: {
        background: luminosity < 0.15 ? color(main).lighten(0.6 - luminosity) : color(main).darken(0.2),
        backgroundActive: color(main).fade(0.9),
        color: negative ? light : dark,
        colorActive: fallbackColor(highlight, negative ? main : dark)
      },
      body: {
        background: color(main).fade(0.9),
        text: grey,
        textActive: dark,
        progress: fallbackColor(highlight, negative ? main : dark),
        icon: negative ? main : dark
      },
      slider: {
        thumb: main
      },
      button: {
        background: main,
        text: negative ? light : dark
      },
      input: {
        border: negative ? main : dark
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
