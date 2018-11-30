import test from 'ava'
import { reducer as runtime } from './reducer'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'SET_RUNTIME',
    payload: {
      language: 'en',
      platform: 'desktop'
    }
  }
})

test(`runtime: it is a reducer function`, t => {
  t.is(typeof runtime, 'function')
})

test(`runtime: it extracts the runtime on SET_RUNTIME`, t => {
  const result = runtime('', testAction)
  t.deepEqual(result, {
    language: 'en',
    platform: 'desktop'
  })
})

test(`runtime: it returns an empty object if a runtime is not available`, t => {
  let result = runtime(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, {})
})

test(`runtime: it sets the language in SET_LANGUAGE`, t => {
  let result = runtime({ platform: 'mobile', language: 'en' }, { type: 'SET_LANGUAGE', payload: 'de' })

  t.deepEqual(result, { platform: 'mobile', language: 'de' })
})

test(`runtime: it does nothing if not the init action is dispatched`, t => {
  const result = runtime('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
