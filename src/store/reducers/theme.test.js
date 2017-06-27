import test from 'ava'
import { theme } from './theme'

test(`theme: is a reducer function`, t => {
  t.is(typeof theme, 'function')
})

test(`theme: it sets the theme on INIT`, t => {
  let result = theme(undefined, {
    type: 'INIT',
    paylaod: {
      theme: {
        main: '#fff',
        highlight: '#000'
      }
    }
  })

  t.is(typeof result, 'object')
})

test(`theme: it has a default fallback if no theme is provided`, t => {
  let result = theme(undefined, {
    type: 'INIT'
  })

  t.is(typeof result, 'object')
})

test(`theme: it sets the theme on SET_THEME`, t => {
  let result = theme(undefined, {
    type: 'SET_THEME',
    paylaod: {
      theme: {
        main: '#fff'
      }
    }
  })

  t.is(typeof result, 'object')
})

test(`theme: it does nothing if a unknown action is dispatched`, t => {
  const result = theme('CUSTOM', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'CUSTOM')
})
