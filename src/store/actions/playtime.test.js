import test from 'ava'
import { setPlaytime, updatePlaytime } from './playtime'

test(`setPlaytimeAction: creates the SET_PLAYTIME action`, t => {
  t.deepEqual(setPlaytime(10), {
    type: 'SET_PLAYTIME',
    payload: 10
  })
})

test(`updatePlaytimeAction: creates the UPDATE_PLAYTIME action`, t => {
  t.deepEqual(updatePlaytime(10), {
    type: 'UPDATE_PLAYTIME',
    payload: 10
  })
})

test(`updatePlaytimeAction: creates the UPDATE_PLAYTIME action`, t => {
  t.deepEqual(updatePlaytime(10), {
    type: 'UPDATE_PLAYTIME',
    payload: 10
  })
})
