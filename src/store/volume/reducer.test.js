import test from 'ava'
import { reducer as volume } from './reducer'

test(`volume: is a reducer function`, t => {
  t.is(typeof volume, 'function')
})

test(`volume: it returns the correct volume`, t => {
  t.is(volume(undefined, {
    type: 'SET_RATE',
    payload: 1
  }), 1)

  t.is(volume(1, {
    type: 'SET_VOLUME',
    payload: -1
  }), 0)

  t.is(volume(1, {
    type: 'SET_VOLUME',
    payload: 2
  }), 1)

  t.is(volume(1, {
    type: 'SET_VOLUME',
    payload: 0.2
  }), 0.2)
})
