import test from 'ava'
import browserEnv from 'browser-env'
import fetchMock from 'fetch-mock'
import request from './request'

browserEnv(['window'])
const nock = global.window.fetch = fetchMock.sandbox()

test.after(nock.reset)

test.beforeEach(nock.reset)

test(`request: exports a function`, t => {
  t.is(typeof request, 'function')
})

test.cb(`request: should resolve an url`, t => {
  t.plan(1)

  nock.get('http://localhost/foo', { foo: 'bar' })

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
