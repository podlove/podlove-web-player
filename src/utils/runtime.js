import { head } from 'lodash'
import browser from 'detect-browser'
import MobileDetect from 'mobile-detect'

import { version } from '../../package.json'

const platform = new MobileDetect(window.navigator.userAgent)

const locale = navigator.language || navigator.userLanguage

const currentLanguage = (() => {
  return head(locale.split('-'))
})()

export default {
  version,
  browser: `${browser.name}:${browser.version}`,
  platform: (platform.tablet() || platform.mobile()) ? 'mobile' : 'desktop',
  language: currentLanguage,
  locale
}
