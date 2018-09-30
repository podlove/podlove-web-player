import test from 'ava'
import { textSearch } from './text-search'

const search = textSearch([
  'foo',
  'bar',
  'baz',
  'bla bla bla',
  'gnarz'
])

test(`it finds an item in a list`, t => {
  t.deepEqual(search('bar'), [1])
})

test(`it returns an empty array if nothing was found`, t => {
  t.deepEqual(search('bar1'), [])
})

test(`it repeats an index if text contains multiple hits`, t => {
  t.deepEqual(search('bla'), [3, 3, 3])
})
