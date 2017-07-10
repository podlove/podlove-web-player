import Vue from 'vue'

import clipboard from './directives/clipboard'
import marquee from './directives/marquee'

const createRenderer = instance => {
  instance.directive('clipboard', clipboard)
  instance.directive('marquee', marquee)
  return instance
}

const Renderer = createRenderer(Vue)

export {
  Renderer
}
