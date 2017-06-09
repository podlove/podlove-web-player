import mediaEffectsFactory from './media'
import storageEffectsFactory from './storage'
import keyboardEffectsFactory from './keyboard'
import componentsEffects from './components'
import idleEffects from './idle'
import quantileEffects from './quantiles'

import storage from 'utils/storage'
import keyhandler from 'utils/keyboard'

import mediaPlayer from '../../media-player'

const mediaEffects = mediaEffectsFactory(mediaPlayer)
const storageEffects = storageEffectsFactory(storage)
const keyboardEffects = keyboardEffectsFactory(keyhandler)

export default store => {
  keyboardEffects(store)

  return next => action => {
    next(action)
    mediaEffects(store, action)
    componentsEffects(store, action)
    storageEffects(store, action)
    idleEffects(store, action)
    quantileEffects(store, action)
  }
}
