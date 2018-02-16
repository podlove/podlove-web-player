import color from 'color'
import { get } from 'lodash'

import { tag } from 'utils/dom'
import css from 'css-loader!autoprefixer-loader!sass-loader!../styles/_loader.scss'

const style = tag('style', css.toString())

const dom = ({ theme }) => {
  const light = '#fff'
  const dark = '#000'

  const main = get(theme, 'main', '#2B8AC6')
  const luminosity = color(main).luminosity()

  const highlight = get(theme, 'highlight', luminosity < 0.25 ? light : dark)

  return `<div class="loader" id="loader" style="background: ${main}">
    <div class="dot bounce1" style="background: ${highlight}"></div>
    <div class="dot bounce2" style="background: ${highlight}"></div>
    <div class="dot bounce3" style="background: ${highlight}"></div>
  </div>`
}

const script = tag('script', `
  var loader = document.getElementById('loader')

  window.addEventListener('load', function() {
    loader.className += ' done'

    setTimeout(loader.remove, 300)
  })
`)

export default config => ([style, dom(config), script].join(''))
