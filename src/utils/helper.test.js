import test from 'ava'
import sinon from 'sinon'
import browserEnv from 'browser-env'

import { inAnimationFrame, asyncAnimation, callWith } from './helper'

browserEnv(['window'])

test(`it exports a function called inAnimationFrame`, t => {
  t.is(typeof inAnimationFrame, 'function')
})

test(`it exports a function called asyncAnimation`, t => {
  t.is(typeof asyncAnimation, 'function')
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

test(`asyncAnimation: returns a promise`, t => {
  const testStub = sinon.stub()

  window.requestAnimationFrame = cb => cb()

  const result = asyncAnimation(testStub)('foo', 'bar')
  t.is(typeof result.then, 'function')
})

test.cb(`asyncAnimation: resolves stub in promise`, t => {
  const testStub = sinon.stub()

  window.requestAnimationFrame = cb => cb()
  const result = asyncAnimation(testStub)('foo', 'bar')

  t.plan(2)
  result.then(() => {
    t.is(testStub.getCall(0).args[0], 'foo')
    t.is(testStub.getCall(0).args[1], 'bar')
    t.end()
  })
})

test(`callWith: calls a function with given args`, t => {
  const testStub = sinon.stub()

  callWith('foo', 'bar')(testStub)

  t.is(testStub.getCall(0).args[0], 'foo')
  t.is(testStub.getCall(0).args[1], 'bar')
})
