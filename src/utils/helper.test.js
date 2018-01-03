import test from 'ava'
import sinon from 'sinon'
import browserEnv from 'browser-env'

import { inAnimationFrame, callWith } from './helper'

browserEnv(['window'])

test(`it exports a function called inAnimationFrame`, t => {
  t.is(typeof inAnimationFrame, 'function')
})

test(`it exports a function called callWith`, t => {
  t.is(typeof callWith, 'function')
})

test(`inAnimationFrame: calls a function on next animation frame`, t => {
  const testStub = sinon.stub()

  window.requestAnimationFrame = cb => cb()

  inAnimationFrame(testStub)('foo', 'bar')

  t.is(testStub.getCall(0).args[0], 'foo')
  t.is(testStub.getCall(0).args[1], 'bar')
})

test(`callWith: calls a function with given args`, t => {
  const testStub = sinon.stub()

  callWith('foo', 'bar')(testStub)

  t.is(testStub.getCall(0).args[0], 'foo')
  t.is(testStub.getCall(0).args[1], 'bar')
})
