const toggleShare = () => ({
  type: 'TOGGLE_SHARE'
})

// Embed
const setShareEmbedSize = size => ({
  type: 'SET_SHARE_EMBED_SIZE',
  payload: size
})

const toggleShareEmbedStart = () => ({
  type: 'TOGGLE_SHARE_EMBED_START'
})

const setShareEmbedStarttime = time => ({
  type: 'SET_SHARE_EMBED_STARTTIME',
  payload: time
})

// Link

const toggleShareLinkStart = () => ({
  type: 'TOGGLE_SHARE_LINK_START'
})

const setShareLinkStarttime = time => ({
  type: 'SET_SHARE_LINK_STARTTIME',
  payload: time
})

export {
  toggleShare,

  setShareEmbedSize,
  toggleShareEmbedStart,
  setShareEmbedStarttime,

  toggleShareLinkStart,
  setShareLinkStarttime
}
