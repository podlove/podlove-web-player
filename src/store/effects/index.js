import mediaEffects from './media'
import idleEffects from './idle'
import storageEffects from './storage'

export default store => next => action => {
  mediaEffects(store, action)
  storageEffects(store, action)
  idleEffects(store, action)

  return next(action)
}
