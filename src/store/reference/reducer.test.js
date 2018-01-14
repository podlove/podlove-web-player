import test from 'ava'

import { reducer as reference } from './reducer'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {
      reference: {
        config: '//config/reference',
        share: '//share/reference',
        origin: '//origin/reference'
      }
    }
  }
})

// REFERENCE TESTS
test(`reference: it is a reducer function`, t => {
  t.is(typeof reference, 'function')
})

test(`reference: it extracts the references`, t => {
  const result = reference({}, testAction)
  t.deepEqual(result, {
    config: '//config/reference',
    share: '//share/reference',
    origin: '//origin/reference'
  })
})

test(`reference: it returns null if a reference is available`, t => {
  delete testAction.payload.reference.share
  let result = reference({}, testAction)
  t.deepEqual(result, {
    config: '//config/reference',
    origin: '//origin/reference',
    share: null
  })

  delete testAction.payload.reference.config
  result = reference({}, testAction)
  t.deepEqual(result, {
    origin: '//origin/reference',
    config: null,
    share: null
  })

  delete testAction.payload.reference.origin
  result = reference({}, testAction)
  t.deepEqual(result, {
    origin: null,
    config: null,
    share: null
  })
})

test(`reference: it does nothing if not the init action is dispatched`, t => {
  const result = reference('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
