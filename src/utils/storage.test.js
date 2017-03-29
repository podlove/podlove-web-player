import test from 'ava'
import sinon from 'sinon'
import browserEnv from 'browser-env'
import storage from './storage'

browserEnv()

test.beforeEach(t => {
  window.localStorage = {
    setItem: sinon.stub(),
    getItem: sinon.stub()
  }

  t.context.testStorage = storage('test')
})

test('it has a storage factory', t => {
  t.truthy(typeof storage === 'function')
})

test('it produces a getter and setter', t => {
  t.truthy(typeof t.context.testStorage.set === 'function')
  t.truthy(typeof t.context.testStorage.get === 'function')
})

test(`get: returns undefined if storage wasn't initialized`, t => {
  t.is(t.context.testStorage.get(null), undefined)
})

test(`set: returns undefined if storage wasn't initialized`, t => {
  t.is(t.context.testStorage.set(null), undefined)
})

test(`set: it calls the setItem`, t => {
  t.context.testStorage.set({foo: 'bar'})
  t.is(window.localStorage.setItem.getCall(0).args[0], 'pwp')
  t.is(window.localStorage.setItem.getCall(0).args[1], JSON.stringify({test: {foo: 'bar'}}))
})

test(`set: it calls the setItem with multiple arguments`, t => {
  t.context.testStorage.set('foo', 'bar')
  t.is(window.localStorage.setItem.getCall(0).args[0], 'pwp')
  t.is(window.localStorage.setItem.getCall(0).args[1], JSON.stringify({test: {foo: 'bar'}}))
})

test(`get: it calls the getItem`, t => {
  t.context.testStorage.get('foo')
  t.is(window.localStorage.getItem.getCall(0).args[0], 'pwp')
})

test(`get: it returns the full store if no key provided`, t => {
  window.localStorage.getItem.returns('{"test": {"foo": "bar"}}')
  t.deepEqual(t.context.testStorage.get(null), {foo: 'bar'})
})

test(`get: it returns the value if key provided`, t => {
  window.localStorage.getItem.returns('{"test": {"foo": "bar"}}')
  t.is(t.context.testStorage.get('foo'), 'bar')
})
