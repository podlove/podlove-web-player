import test from 'ava'
import { reducer as files } from './reducer'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {
      audio: [{
        url: 'http://foo.bar'
      }, {
        url: 'http://foo.baz'
      }]
    }
  }
})

test(`files: it is a reducer function`, t => {
  t.is(typeof files, 'function')
})

test(`files: it extracts the audio meta information`, t => {
  const result = files({}, testAction)

  t.deepEqual(result, {
    audio: [{
      url: 'http://foo.bar'
    }, {
      url: 'http://foo.baz'
    }]
  })
})

test(`files: it does nothing if not a registered action is dispatched`, t => {
  const result = files('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
