import test from 'ava'
import { setTheme } from './actions'

test(`setThemeAction: creates the SET_THEME action`, t => {
  t.deepEqual(setTheme('theme'), {
    type: 'SET_THEME',
    payload: 'theme'
  })
})
