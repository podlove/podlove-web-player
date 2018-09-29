import test from 'ava'
import { binarySearch } from './binary-search'

const search = binarySearch([
  0,
  1,
  2,
  3,
  4,
  5,
  10
])

test(`it finds an item in a list`, t => {
  t.is(search(3), 3)
})

test(`it finds the nearest index`, t => {
  t.is(search(9), 5)
})

test(`it falls back to -1 if no lower index was found`, t => {
  t.is(search(-5), -1)
})
