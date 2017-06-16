import test from 'ava'
import { init } from './init'

test(`initAction: creates the INIT action`, t => {
  t.deepEqual(init({foo: 'bar'}), {
    type: 'INIT',
    payload: {
      foo: 'bar'
    }
  })
})
