import test from 'ava'
import { ghost } from './ghost'

test(`ghost: it exports a reducer function`, t => {
  t.truthy(typeof ghost === 'function')
})

test(`ghost: it returns the initial state on default`, t => {
  const result = ghost(undefined, {
    type: 'FOO'
  })

  t.deepEqual(result, {
    time: 0,
    active: false
  })
})

test(`ghost: it sets the ghost time on SIMULATE_PLAYTIME`, t => {
  const result = ghost(undefined, {
    type: 'SIMULATE_PLAYTIME',
    payload: 100
  })

  t.deepEqual(result, {
    time: 100,
    active: false
  })
})

test(`ghost: it activates the ghost mode on ENABLE_GHOST_MODE`, t => {
  const result = ghost(undefined, {
    type: 'ENABLE_GHOST_MODE'
  })

  t.deepEqual(result, {
    time: 0,
    active: true
  })
})

test(`ghost: it disables the ghost mode on DISABLE_GHOST_MODE`, t => {
  const result = ghost(undefined, {
    type: 'DISABLE_GHOST_MODE'
  })

  t.deepEqual(result, {
    time: 0,
    active: false
  })
})
