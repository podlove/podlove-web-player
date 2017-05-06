import Vue from 'vue'
import VueI18n from 'vue-i18n'

import clipboard from './directives/clipboard'
import marquee from './directives/marquee'
import languagePacks from 'lang'

const createRenderer = instance => {
  instance.directive('clipboard', clipboard)
  instance.directive('marquee', marquee)
  return instance
}

const Renderer = createRenderer(Vue)

export {
  Renderer
}
