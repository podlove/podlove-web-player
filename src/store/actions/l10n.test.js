import test from 'ava'
import { setLanguage } from './l10n'

test(`setLanguage: creates the SET_LANGUAGE action`, t => {
  t.deepEqual(setLanguage('de'), {
    type: 'SET_LANGUAGE',
    payload: 'de'
  })
})
