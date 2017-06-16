import test from 'ava'
import {
    toggleShare,
    setShareEmbedSize,
    toggleShareEmbedStart,
    setShareEmbedStarttime,
    toggleShareLinkStart,
    setShareLinkStarttime
} from './share'

test(`toggleShareAction: creates the TOGGLE_SHARE action`, t => {
  t.deepEqual(toggleShare(), {
    type: 'TOGGLE_SHARE'
  })
})

test(`setShareEmbedDimensionsAction: creates the SET_SHARE_EMBED_SIZE action`, t => {
  t.deepEqual(setShareEmbedSize('100x100'), {
    type: 'SET_SHARE_EMBED_SIZE',
    payload: '100x100'
  })
})

test(`toggleShareEmbedStartAction: creates the TOGGLE_SHARE_EMBED_START action`, t => {
  t.deepEqual(toggleShareEmbedStart(), {
    type: 'TOGGLE_SHARE_EMBED_START'
  })
})

test(`setShareEmbedStarttimeAction: creates the SET_SHARE_EMBED_STARTTIME action`, t => {
  t.deepEqual(setShareEmbedStarttime(100), {
    type: 'SET_SHARE_EMBED_STARTTIME',
    payload: 100
  })
})

test(`toggleShareEmbedStartAction: creates the TOGGLE_SHARE_EMBED_START action`, t => {
  t.deepEqual(toggleShareEmbedStart(), {
    type: 'TOGGLE_SHARE_EMBED_START'
  })
})

test(`toggleShareLinkStartAction: creates the TOGGLE_SHARE_LINK_START action`, t => {
  t.deepEqual(toggleShareLinkStart(), {
    type: 'TOGGLE_SHARE_LINK_START'
  })
})

test(`setShareLinkStarttimeAction: creates the SET_SHARE_LINK_STARTTIME action`, t => {
  t.deepEqual(setShareLinkStarttime(100), {
    type: 'SET_SHARE_LINK_STARTTIME',
    payload: 100
  })
})
