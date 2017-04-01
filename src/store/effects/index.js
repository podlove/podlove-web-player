import mediaEffectsFactory from './media'
import storageEffectsFactory from './storage'
import idleEffects from './idle'
import storage from 'utils/storage'

import mediaPlayer from '../../media-player'

const mediaEffects = mediaEffectsFactory(mediaPlayer)
const storageEffects = storageEffectsFactory(storage)

export default store => next => action => {
  mediaEffects(store, action)
  storageEffects(store, action)
  idleEffects(store, action)

  return next(action)
}
