import { compose } from 'lodash/fp'
import storage from 'utils/storage'
import keyhandler from 'utils/keyboard'

import { hasProperty, effect } from 'utils/effects'
import { callWith } from 'utils/helper'

import playerEffectsFactory from './player'
import storageEffectsFactory from './storage'
import keyboardEffectsFactory from './keyboard'
import componentsEffects from './components'
import quantileEffects from './quantiles'
import chapterEffects from './chapters'
import volumeEffects from './volume'
import urlEffects from './url'
import transcriptEffects from './transcripts'

import mediaPlayer from '../../media'

const storageEffects = storageEffectsFactory(storage)
const keyboardEffects = keyboardEffectsFactory(keyhandler)
const playerEffects = playerEffectsFactory(mediaPlayer)

const dispatcherEffects = [keyboardEffects]

let actionEffects = [
  compose(effect(chapterEffects), hasProperty('chapters')),
  effect(playerEffects),
  effect(storageEffects),
  effect(quantileEffects),
  effect(volumeEffects),
  effect(componentsEffects),
  effect(urlEffects),
  compose(effect(transcriptEffects), hasProperty('transcripts'))
]

export default store => {
  dispatcherEffects.map(callWith(store))

  return next => action => {
    next(action)

    // Conditional effects need the initial payload to create
    if (action.type === 'INIT') {
      actionEffects = actionEffects.map(callWith(action.payload))
    }

    actionEffects.map(callWith(store, action))
  }
}
