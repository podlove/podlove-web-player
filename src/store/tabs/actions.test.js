import test from 'ava'
import { toggleTab, setTabs } from './actions'

test(`toggleTab: creates the TOGGLE_TAB action`, t => {
  t.deepEqual(toggleTab('settings'), {
    type: 'TOGGLE_TAB',
    payload: 'settings'
  })
})

test(`setTabs: creates the SET_TABS action`, t => {
  t.deepEqual(setTabs({ settings: false }), {
    type: 'SET_TABS',
    payload: { settings: false }
  })
})
