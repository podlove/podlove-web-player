import { noop, isArray, isString } from 'lodash'
import { curry, compose, get } from 'lodash/fp'

import { isUndefinedOrNull, isDefinedAndNotNull } from './predicates'

const truthy = input => input === true

const isArrayProperty = input => isArray(input) ? input.length > 0 : input
const isStringProperty = input => isString(input) ? input.length > 0 : input

// Check if payload has property
export const hasProperty = property => compose(truthy, isArrayProperty, isStringProperty, get(property))

export const effect = effectFunc => (precondition = true) => precondition ? effectFunc : noop

// Dispatches only if the data is defined
export const prohibitiveDispatch = (dispatch, action) => data => isDefinedAndNotNull(data) ? dispatch(action(data)) : null
