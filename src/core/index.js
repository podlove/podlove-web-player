import Vue from 'vue'

import clipboard from './directives/clipboard'
import marquee from './directives/marquee'

const createRenderer = instance => {
  instance.directive('clipboard', clipboard)
  instance.directive('marquee', marquee)
  return instance
}

export const Renderer = createRenderer(Vue)
