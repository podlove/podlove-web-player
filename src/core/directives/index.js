import clipboard from './clipboard'
import resize from './resize'
import marquee from './marquee'

const registerDirectives = context => {
  context.Renderer.directive('clipboard', clipboard)
  context.Renderer.directive('resize', resize)
  context.Renderer.directive('marquee', marquee)

  return context
}

export {
  registerDirectives
}
