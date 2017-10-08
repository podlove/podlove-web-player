import clipboard from './directives/clipboard'

const registerDirectives = context => {
  context.Renderer.directive('clipboard', clipboard)

  return context
}

export {
  registerDirectives
}
