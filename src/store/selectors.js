import { compose, get } from 'lodash/fp'

import { selectors as chapters } from './chapters'

const storeSelector = (group = '', selectors = {}) => Object.keys(selectors).reduce((res, selector) => ({
  ...res,
  [selector]: compose(selectors[selector], get(group))
}), {})

export default {
  ...storeSelector('chapters', chapters)
}
