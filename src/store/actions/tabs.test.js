import test from 'ava'
import { toggleTab } from './tabs'

test(`toggleTabAction: creates the TOGGLE_TAB action`, t => {
  t.deepEqual(toggleTab('settings'), {
    type: 'TOGGLE_TAB',
    payload: 'settings'
  })
})
