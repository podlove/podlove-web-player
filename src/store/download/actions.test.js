import test from 'ava'
import { setDownloadFile } from './actions'

test(`setDownloadFile: creates the SET_DOWNLOAD_FILE action`, t => {
  t.deepEqual(setDownloadFile('http://foo.bar'), {
    type: 'SET_DOWNLOAD_FILE',
    payload: 'http://foo.bar'
  })
})
