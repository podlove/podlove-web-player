import { createAction } from 'redux-actions'

import { SET_SHARE_CONTENT, SHOW_SHARE_EMBED, HIDE_SHARE_EMBED, SET_SHARE_EMBED_SIZE } from '../types'

export const setShareContent = createAction(SET_SHARE_CONTENT)
export const showShareEmbed = createAction(SHOW_SHARE_EMBED)
export const hideShareEmbed = createAction(HIDE_SHARE_EMBED)
export const setShareEmbedSize = createAction(SET_SHARE_EMBED_SIZE)
