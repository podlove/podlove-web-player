import get from 'lodash/get'

import store from '../store'
import media from './media'

const registerMediaEffects = mediaElement => {
  const player = media(mediaElement)

  store.subscribe(() => {
    const lastAction = get(store.getState(), 'lastAction')

    player(lastAction)
  })
}

export {
  registerMediaEffects
}
