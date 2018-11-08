import { createAction } from 'redux-actions'

import { SET_SHARE_CONTENT, SET_SHARE_EMBED_SIZE } from '../types'

export const setShareContent = createAction(SET_SHARE_CONTENT)
export const setShareEmbedSize = createAction(SET_SHARE_EMBED_SIZE)
