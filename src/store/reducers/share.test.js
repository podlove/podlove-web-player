import test from 'ava'
import { share } from './share'

let expected

test.beforeEach(t => {
  expected = {
    open: false,
    embed: {
      size: '250x400',
      availableSizes: ['250x400', '320x400', '375x400', '600x290', '768x290'],
      start: false,
      starttime: 0
    },
    link: {
      start: false,
      starttime: 0
    },
    download: {
      files: []
    }
  }
})

test(`share: is a reducer function`, t => {
  t.is(typeof share, 'function')
})

test(`share: it transforms the download files on startup`, t => {
  let result = share(undefined, {
    type: 'INIT',
    payload: {
      audio: ['foo.bar', 'bar.baz']
    }
  })

  expected.download.files = [{
    file: 'foo.bar',
    active: true,
    type: 'bar'
  }, {
    file: 'bar.baz',
    active: false,
    type: 'baz'
  }]

  t.deepEqual(result, expected)
})

test(`share: it togges the overlay state on TOGGLE_SHARE`, t => {
  let result = share(undefined, {
    type: 'TOGGLE_SHARE'
  })

  expected.open = true
  t.deepEqual(result, expected)

  result = share(result, {
    type: 'TOGGLE_SHARE'
  })

  expected.open = false
  t.deepEqual(result, expected)
})

test(`share: it sets the start time state on SET_SHARE_EMBED_STARTTIME`, t => {
  let result = share(undefined, {
    type: 'SET_SHARE_EMBED_STARTTIME',
    payload: 20
  })

  expected.embed.starttime = 20
  t.deepEqual(result, expected)
})

test(`share: it toggles the start time on TOGGLE_SHARE_EMBED_START`, t => {
  let result = share(undefined, {
    type: 'TOGGLE_SHARE_EMBED_START'
  })

  expected.embed.start = true
  t.deepEqual(result, expected)

  result = share(result, {
    type: 'TOGGLE_SHARE_EMBED_START'
  })

  expected.embed.start = false
  t.deepEqual(result, expected)
})

test(`share: it sets the dimensions on SET_SHARE_EMBED_SIZE`, t => {
  let result = share(undefined, {
    type: 'SET_SHARE_EMBED_SIZE',
    payload: '100x100'
  })
  expected.embed.size = '100x100'

  t.deepEqual(result, expected)
})

test(`share: it does nothing if a unknown action is dispatched`, t => {
  const result = share(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })

  t.deepEqual(result, expected)
})

test(`share: it toggles the start time on TOGGLE_SHARE_LINK_START`, t => {
  let result = share(undefined, {
    type: 'TOGGLE_SHARE_LINK_START'
  })

  expected.link.start = true
  t.deepEqual(result, expected)

  result = share(result, {
    type: 'TOGGLE_SHARE_LINK_START'
  })

  expected.link.start = false
  t.deepEqual(result, expected)
})

test(`share: it sets the start time state on SET_SHARE_LINK_STARTTIME`, t => {
  let result = share(undefined, {
    type: 'SET_SHARE_LINK_STARTTIME',
    payload: 20
  })

  expected.link.starttime = 20
  t.deepEqual(result, expected)
})

test(`share: it switches the download file on SWITCH_DOWNLOAD_FILE`, t => {
  expected.download.files = [{
    file: 'foo.bar',
    active: true,
    type: 'bar'
  }, {
    file: 'bar.baz',
    active: false,
    type: 'baz'
  }]

  let result = share(expected, {
    type: 'SWITCH_DOWNLOAD_FILE',
    payload: 'bar.baz'
  })

  expected.download.files[0].active = false
  expected.download.files[1].active = true

  t.deepEqual(result, expected)
})
