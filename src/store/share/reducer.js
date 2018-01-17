import { handleActions } from 'redux-actions'

import { SET_SHARE_CONTENT, SET_SHARE_EMBED_SIZE, SHOW_SHARE_EMBED, HIDE_SHARE_EMBED } from '../types'

export const INITIAL_STATE = {
  content: 'episode',
  embed: {
    visible: false,
    available: ['250x400', '320x400', '375x400', '600x290', '768x290'],
    size: '320x400'
  }
}

export const reducer = handleActions({
  [SET_SHARE_CONTENT]: (state, { payload }) => ({
    ...state,
    content: payload
  }),

  [SET_SHARE_EMBED_SIZE]: (state, { payload }) => ({
    ...state,
    embed: {
      ...state.embed,
      size: payload
    }
  }),

  [SHOW_SHARE_EMBED]: state => ({
    ...state,
    embed: {
      ...state.embed,
      visible: true
    }
  }),

  [HIDE_SHARE_EMBED]: state => ({
    ...state,
    embed: {
      ...state.embed,
      visible: false
    }
  })
}, INITIAL_STATE)
