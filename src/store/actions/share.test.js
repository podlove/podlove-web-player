import test from 'ava'
import {
  setShareContent,
  showShareEmbed,
  hideShareEmbed,
  setShareEmbedSize
} from './share'

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

test(`showShareEmbedAction: creates the SHOW_SHARE_EMBED action`, t => {
  t.deepEqual(showShareEmbed(), {
    type: 'SHOW_SHARE_EMBED'
  })
})

test(`hideShareEmbedAction: creates the HIDE_SHARE_EMBED action`, t => {
  t.deepEqual(hideShareEmbed(), {
    type: 'HIDE_SHARE_EMBED'
  })
})
