import test from 'ava'
import superagent from 'superagent'
import nocker from 'superagent-nock'

import request from './request'

let nock

test.beforeEach(t => {
  nock = nocker(superagent)
})

test(`request: exports a function`, t => {
  t.is(typeof request, 'function')
})

test.cb(`request: should resolve an url`, t => {
  t.plan(1)

  nock('http://localhost')
    .get('/foo')
    .reply(200, { foo: 'bar' })

  request('http://localhost/foo')
    .then(result => {
      t.deepEqual(result, { foo: 'bar' })
      t.end()
    })
})

test.cb(`request: should return an object`, t => {
  t.plan(1)

  request({ foo: 'bar' })
    .then(result => {
      t.deepEqual(result, { foo: 'bar' })
      t.end()
    })
})
