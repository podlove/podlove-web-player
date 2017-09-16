import test from 'ava'
import { download } from './download'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {
      audio: [{
        url: 'http://foo.bar'
      }, {
        url: 'http://foo.baz'
      }]
    }
  }
})

test(`download: it is a reducer function`, t => {
  t.is(typeof download, 'function')
})

test(`download: it extracts the audio meta information`, t => {
  const result = download({}, testAction)

  t.deepEqual(result, {
    files: [{
      url: 'http://foo.bar'
    }, {
      url: 'http://foo.baz'
    }],
    selected: 'http://foo.bar'
  })
})

test(`download: it sets the audio url on SET_DOWNLOAD_FILE`, t => {
  const result = download(undefined, {
    type: 'SET_DOWNLOAD_FILE',
    payload: 'http://foo.baz'
  })

  t.deepEqual(result, {
    files: [],
    selected: 'http://foo.baz'
  })
})

test(`download: it does nothing if not a registered action is dispatched`, t => {
  const result = download('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
