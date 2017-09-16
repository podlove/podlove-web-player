import Vue from 'vue'
import { compose } from 'lodash/fp'
import { head } from 'lodash'
import { registerDirectives } from './directives'
import { registerLang } from './lang'

const registerApp = context => {
  return new context.Renderer({
    i18n: context.i18n,
    el: head(document.getElementsByTagName(context.selector)),
    render: h => h(context.App)
  })
}

const boot = compose(registerApp, registerLang, registerDirectives)

export const createApp = (selector, App) => {
  return boot({
    Renderer: Vue,
    App,
    selector
  })
}
