import test from 'ava'
import sinon from 'sinon'
import browserEnv from 'browser-env'
import { findNode, createNode, appendNode, tag } from './dom'

browserEnv()

test.before(t => {
  sinon.spy(document, 'querySelectorAll')
  sinon.spy(document, 'createElement')
})

test('exports a method called findNode', t => {
  t.truthy(typeof findNode === 'function')
})

test('exports a method called createNode', t => {
  t.truthy(typeof createNode === 'function')
})

test('exports a method called appendNode', t => {
  t.truthy(typeof appendNode === 'function')
})

test('exports a method called tag', t => {
  t.truthy(typeof tag === 'function')
})

test('findNode should call the document api', t => {
  findNode('body')
  t.is(document.querySelectorAll.getCall(0).args[0], 'body')
})

test('createNode should call the document api', t => {
  createNode('div')
  t.is(document.createElement.getCall(0).args[0], 'DiV')
})

test('appendNode should call the document api', t => {
  let testNode = document.createElement('div')
  let appender = appendNode(testNode)
  appender(document.createElement('p'))

  t.is(testNode.children[0].tagName, 'P')
})

test('tag should create a html tag', t => {
  t.is(tag('p', 'foo'), '<p>foo</p>')
  t.is(tag('div', 'foo', {bar: 'baz', bla: 'blub'}), '<div bar="baz" bla="blub">foo</div>')
})
