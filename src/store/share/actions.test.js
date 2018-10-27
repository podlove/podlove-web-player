import test from 'ava'
import {
  setShareContent,
  setShareEmbedSize
} from './actions'

test(`setShareContentAction: creates the SET_SHARE_CONTENT action`, t => {
  t.deepEqual(setShareContent('episode'), {
    type: 'SET_SHARE_CONTENT',
    payload: 'episode'
  })
})

test(`setShareEmbedSizeAction: creates the SET_SHARE_EMBED_SIZE action`, t => {
  t.deepEqual(setShareEmbedSize('250x400'), {
    type: 'SET_SHARE_EMBED_SIZE',
    payload: '250x400'
  })
})
