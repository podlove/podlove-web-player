import test from 'ava'
import { reducer as speakers } from './reducer'

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

test(`speakers: it is a reducer function`, t => {
  t.is(typeof speakers, 'function')
})

test(`speakers: it sets the onair speakers on INIT`, t => {
  const result = speakers(undefined, testAction)

  t.deepEqual(result, [{
    name: 'foo',
    group: { slug: 'onair' }
  }])
})

test(`speakers: it does nothing if not a registered action is dispatched`, t => {
  const result = speakers('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
