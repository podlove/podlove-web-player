import VueI18n from 'vue-i18n'

const messages = {
  en: require('../../lang/en.json'),
  de: require('../../lang/de.json'),
  eo: require('../../lang/eo.json')
}

export const registerLang = context => {
  context.Renderer.use(VueI18n)

  return {
    ...context,
    i18n: new VueI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages
    })
  }
}
