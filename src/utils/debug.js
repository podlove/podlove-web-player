import { version } from '../../package.json'
import browser from 'detect-browser'

export default ({
    version,
    browser: `${browser.name}:${browser.version}`
})