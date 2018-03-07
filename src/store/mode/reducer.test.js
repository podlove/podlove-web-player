import test from 'ava'
import { reducer as mode } from './reducer'

test(`mode: it falls back to default mode if not live`, t => {
  const result = mode(undefined, {
    type: 'INIT',
    payload: {
      mode: 'foobar'
    }
  })
  t.deepEqual(result, 'episode')
})

test(`mode: it sets the provided mode to live`, t => {
  const result = mode(undefined, {
    type: 'INIT',
    payload: {
      mode: 'live'
    }
  })
  t.deepEqual(result, 'live')
})

test(`mode: it does nothing if not the init action is dispatched`, t => {
  const result = mode('foo', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, 'foo')
})

test(`mode: it has a default fallback if a missing state is provided`, t => {
  const result = mode(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, 'episode')
})
