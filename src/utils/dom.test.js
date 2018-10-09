import test from 'ava'
import sinon from 'sinon'
import browserEnv from 'browser-env'
import { findNode, createNode, appendNode, tag, setStyles, addClasses, getClasses, removeClasses, setAttributes, hasOverflow, cleanDom } from './dom'

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

test('exports a method called setStyles', t => {
  t.truthy(typeof setStyles === 'function')
})

test('exports a method called getClasses', t => {
  t.truthy(typeof getClasses === 'function')
})

test('exports a method called addClasses', t => {
  t.truthy(typeof addClasses === 'function')
})

test('exports a method called removeClasses', t => {
  t.truthy(typeof removeClasses === 'function')
})

test('exports a method called setAttributes', t => {
  t.truthy(typeof setAttributes === 'function')
})

test('exports a method called hasOverflow', t => {
  t.truthy(typeof hasOverflow === 'function')
})

test('exports a method called cleanDom', t => {
  t.truthy(typeof cleanDom === 'function')
})

test('findNode should call the document api', t => {
  const result = findNode('body')

  t.is(document.querySelectorAll.getCall(0).args[0], 'body')
  t.deepEqual(result, document.body)
})

test(`findNode returns a given dom node`, t => {
  const testNode = document.createElement('p')
  const result = findNode(testNode)

  t.deepEqual(testNode, result)
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
  t.is(tag('div', 'foo', { bar: 'baz', bla: 'blub' }), '<div bar="baz" bla="blub">foo</div>')
})

test('setStyles adds styles to a dom node', t => {
  const testNode = createNode('div')

  setStyles({ color: 'red', width: '200px' })(testNode)

  t.is(testNode.style.color, 'red')
  t.is(testNode.style.width, '200px')
})

test(`getClasses should return the class names`, t => {
  const testNode = createNode('div')

  addClasses(['foo', 'bar'])(testNode)

  t.deepEqual(getClasses(testNode), ['foo', 'bar'])
})

test(`addClasses should add classes to dom elements`, t => {
  const testNode = createNode('div')
  addClasses(['foo', 'bar'])(testNode)

  t.is(testNode.className, 'foo bar')
})

test(`removeClasses should remove classes to dom elements`, t => {
  const testNode = createNode('div')
  testNode.className = 'foo bar baz'
  removeClasses(['foo', 'bar'])(testNode)

  t.is(testNode.className, 'baz')
})

test(`setAttributes should add attributes to an dom element`, t => {
  const testNode = createNode('div')
  setAttributes()(testNode)
  setAttributes({ title: 'foobar' })(testNode)

  t.is(testNode.getAttribute('title'), 'foobar')
})

test(`hasOverflow should return true if clientWidth is smaller than scrollWidth`, t => {
  const testNode = {
    clientWidth: 500,
    scrollWidth: 700
  }

  t.is(hasOverflow(testNode), true)
})

test(`hasOverflow should return false if clientWidth is large than scrollWidth`, t => {
  const testNode = {
    clientWidth: 500,
    scrollWidth: 400
  }

  t.is(hasOverflow(testNode), false)
})

test(`cleanDom should call removeChild on unmatched nodes`, t => {
  const testNode = {
    children: [{
      tagName: 'H1'
    }, {
      tagName: 'IFRAME'
    }],
    removeChild: sinon.stub()
  }

  cleanDom('iframe', testNode)
  t.deepEqual(testNode.removeChild.getCall(0).args[0], testNode.children[0])
})
