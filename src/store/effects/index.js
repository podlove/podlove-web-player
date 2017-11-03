import playerEffectsFactory from './player'
import storageEffectsFactory from './storage'
import keyboardEffectsFactory from './keyboard'
import componentsEffects from './components'
import idleEffects from './idle'
import quantileEffects from './quantiles'
import chapterEffects from './chapters'
import volumeEffects from './volume'
import urlEffects from './url'

import storage from 'utils/storage'
import keyhandler from 'utils/keyboard'
import mediaPlayer from '../../media'

const storageEffects = storageEffectsFactory(storage)
const keyboardEffects = keyboardEffectsFactory(keyhandler)
const playerEffects = playerEffectsFactory(mediaPlayer)

export default store => {
  keyboardEffects(store)

  return next => action => {
    next(action)
    chapterEffects(store, action)
    storageEffects(store, action)
    idleEffects(store, action)
    quantileEffects(store, action)
    volumeEffects(store, action)
    componentsEffects(store, action)
    playerEffects(store, action)
    urlEffects(store, action)
  }
}
