import test from 'ava'
import { share } from './share'

let expected

test.beforeEach(t => {
  expected = {
    content: 'episode',
    embed: {
      visible: false,
      available: ['250x400', '320x400', '375x400', '600x290', '768x290'],
      size: '320x400'
    }
  }
})

test(`share: is a reducer function`, t => {
  t.is(typeof share, 'function')
})

test(`share: it returns the state on default`, t => {
  let result = share(undefined, {
    type: 'FOO_BAR'
  })

  t.deepEqual(result, expected)
})

test(`share: it sets the share content on SET_SHARE_CONTENT`, t => {
  let result = share(undefined, {
    type: 'SET_SHARE_CONTENT',
    payload: 'episode'
  })

  expected.content = 'episode'
  t.deepEqual(result, expected)
})

test(`share: it sets the embed size on SET_SHARE_EMBED_SIZE`, t => {
  let result = share(undefined, {
    type: 'SET_SHARE_EMBED_SIZE',
    payload: '250x400'
  })

  expected.embed.size = '250x400'
  t.deepEqual(result, expected)
})

test(`share: it shows the embed dialog on SHOW_SHARE_EMBED`, t => {
  let result = share(undefined, {
    type: 'SHOW_SHARE_EMBED'
  })

  expected.embed.visible = true
  t.deepEqual(result, expected)
})

test(`share: it shows the embed dialog on HIDE_SHARE_EMBED`, t => {
  expected.embed.visible = true

  let result = share(expected, {
    type: 'HIDE_SHARE_EMBED'
  })

  expected.embed.visible = false
  t.deepEqual(result, expected)
})
