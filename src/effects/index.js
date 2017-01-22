import get from 'lodash/get'

import revue from 'store'

import media from './media'
import idle from './idle'

const registerMediaEffects = mediaElement => {
  const player = media(mediaElement)

  revue.store.subscribe(() => {
    const lastAction = get(revue.store.getState(), 'lastAction')

    player(lastAction)
  })
}

const registerIdleEffects = () => {
  revue.store.subscribe(() => {
    const lastAction = get(revue.store.getState(), 'lastAction')

    idle(lastAction)
  })
}

export {
  registerMediaEffects,
  registerIdleEffects
}
