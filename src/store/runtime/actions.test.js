import test from 'ava'
import { setLanguage, setRuntime } from './actions'

test(`setLanguage: creates the SET_LANGUAGE action`, t => {
  t.deepEqual(setLanguage('de'), {
    type: 'SET_LANGUAGE',
    payload: 'de'
  })
})

test(`setLanguage: creates the SET_LANGUAGE action`, t => {
  t.deepEqual(setRuntime({ language: 'de' }), {
    type: 'SET_RUNTIME',
    payload: { language: 'de' }
  })
})
