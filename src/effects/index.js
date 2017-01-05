import get from 'lodash/get'

import revue from 'store'
import media from './media'


const registerMediaEffects = mediaElement => {
  const player = media(mediaElement)

  revue.store.subscribe(() => {
    const lastAction = get(revue.store.getState(), 'lastAction')

    player(lastAction)
  })
}

export {
  registerMediaEffects
}
