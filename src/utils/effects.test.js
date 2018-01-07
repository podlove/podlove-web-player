import test from 'ava'
import sinon from 'sinon'

import { hasProperty, conditionalEffect, prohibitiveDispatch } from './effects'

test(`it exports a function called hasProperty`, t => {
  t.is(typeof hasProperty, 'function')
})

test(`it exports a function called conditionalEffect`, t => {
  t.is(typeof conditionalEffect, 'function')
})

test(`it exports a function called prohibitiveDispatch`, t => {
  t.is(typeof prohibitiveDispatch, 'function')
})

test(`hasProperty: returns true if a property exists`, t => {
  const testData = {
    foo: 'bar',
    bar: ['baz']
  }

  t.true(hasProperty('foo')(testData))
  t.true(hasProperty('bar')(testData))
})

test(`hasProperty: returns false if a property doesn't exists`, t => {
  const testData = {
    bar: []
  }

  t.false(hasProperty('foo')(testData))
  t.false(hasProperty('bar')(testData))
})

test(`conditionalEffect: calls a function if a precondition is fulfilled`, t => {
  const testStub = sinon.stub()

  conditionalEffect(testStub)(true)()

  t.is(testStub.getCalls().length, 1)
})

test(`conditionalEffect: dosen't call a function if a precondition is not fulfilled`, t => {
  const testStub = sinon.stub()

  conditionalEffect(testStub)(false)()

  t.is(testStub.getCalls().length, 0)
})

test(`prohibitiveDispatch: calls a dispatch function if data is defined`, t => {
  const testDispatch = sinon.stub()

  const testAction = payload => ({
    type: 'FOOO',
    payload
  })

  prohibitiveDispatch(testDispatch, testAction)('bar')

  t.deepEqual(testDispatch.getCall(0).args[0], {
    type: 'FOOO',
    payload: 'bar'
  })
})

test(`prohibitiveDispatch: doesn't callsa dispatch function if data is undefined`, t => {
  const testDispatch = sinon.stub()

  const testAction = payload => ({
    type: 'FOOO',
    payload
  })

  prohibitiveDispatch(testDispatch, testAction)()

  t.is(testDispatch.getCalls().length, 0)
})
