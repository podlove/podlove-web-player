import test from 'ava'
import { contributors } from './contributors'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {
      contributors: [{
        name: 'foo',
        group: { slug: 'onair' }
      }, {
        name: 'bar',
        group: { slug: 'team' }
      }]
    }
  }
})

test(`contributors: it is a reducer function`, t => {
  t.is(typeof contributors, 'function')
})

test(`contributors: it sets the onair contributors on INIT`, t => {
  const result = contributors(undefined, testAction)

  t.deepEqual(result, [{
    name: 'foo',
    group: { slug: 'onair' }
  }])
})

test(`contributors: it does nothing if not a registered action is dispatched`, t => {
  const result = contributors('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
