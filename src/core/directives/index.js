import clipboard from './directives/clipboard'
import marquee from './directives/marquee'

const registerDirectives = context => {
  context.Renderer.directive('clipboard', clipboard)
  context.Renderer.directive('marquee', marquee)

  return context
}

export {
  registerDirectives
}
