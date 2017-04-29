import { version } from '../../package.json'
import browser from 'detect-browser'
import MobileDetect from 'mobile-detect'

const platform = new MobileDetect(window.navigator.userAgent)

export default {
  version,
  browser: `${browser.name}:${browser.version}`,
  platform: (platform.tablet() || platform.mobile()) ? 'mobile' : 'desktop'
}
