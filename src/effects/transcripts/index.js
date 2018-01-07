// Fetches data from given transcript, transforms fetched data and dispatches transformed result to store
import fetchEffects from './fetch'
import activeEffects from './active'
import searchEffects from './search'

import { callWith } from 'utils/helper'

const effects = [fetchEffects, activeEffects, searchEffects]

export default (store, action) => effects.map(callWith(store, action))
