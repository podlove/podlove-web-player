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

  const fallbackColor = (first, second) => first || second

  return {
    background: light,
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
        buffer: negative ? color(light).fade(0.5) : color(dark).fade(0.7),
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
        background: luminosity < 0.15 ? color(main).lighten(0.2 - luminosity) : color(main).darken(0.2),
        backgroundActive: color(main).fade(0.9),
        color: negative ? light : dark,
        colorActive: negative ? main : dark
      },
      body: {
        background: color(main).fade(0.9),
        text: grey,
        textActive: dark,
        icon: negative ? main : dark,
        section: color(main).fade(0.8)
      },
      chapters: {
        progress: color(negative ? main : dark).fade(0.1),
        active: fallbackColor(highlight ? color(highlight).fade(0.5) : undefined, negative ? color(main).fade(0.8) : color(dark).fade(0.9)),
        ghost: color(negative ? main : dark).fade(0.7)
      },
      share: {
        content: {
          active: {
            background: color(main).fade(0.2),
            color: negative ? light : dark
          }
        },
        platform: {
          background: color(main).fade(0.8),
          icon: negative ? light : dark,
          color: negative ? light : dark,
          input: color(main).fade(0.2),
          button: main
        }
      }
    },
    overlay: {
      button: negative ? light : dark,
      background: color(main).lighten(0.9)
    },
    input: {
      border: negative ? main : dark,
      background: light,
      color: dark
    },
    button: {
      background: main,
      color: negative ? light : dark,
      border: negative ? main : dark
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
