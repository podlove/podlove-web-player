import Vue from 'vue'
import VueI18n from 'vue-i18n'

const messages = {
  en: require('./en.json'),
  de: require('./de.json')
}

Vue.use(VueI18n)

export default new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})
