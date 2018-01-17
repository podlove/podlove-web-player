import { noop, isArray, isString } from 'lodash'
import { compose, get, isFunction } from 'lodash/fp'

import { isDefinedAndNotNull } from './predicates'

const truthy = input => input === true

const isArrayProperty = input => isArray(input) ? input.length > 0 : input
const isStringProperty = input => isString(input) ? input.length > 0 : input

// Check if payload has property
export const hasProperty = property => compose(truthy, isArrayProperty, isStringProperty, get(property))

// Dispatches only if the data is defined
export const prohibitiveDispatch = (dispatch, action) => data => isDefinedAndNotNull(data) ? dispatch(action(data)) : null

// effect handler
export const handleActions = effectFunc => (store, action) => {
  const effect = get(action.type)(effectFunc)

  return isFunction(effect) ? effect(store, action, store.getState()) : noop
}

export const conditionalEffect = effectFunc => (precondition = true) => precondition ? effectFunc : noop
