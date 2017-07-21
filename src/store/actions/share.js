const setShareContent = type => ({
  type: 'SET_SHARE_CONTENT',
  payload: type
})

const showShareEmbed = () => ({
  type: 'SHOW_SHARE_EMBED'
})

const hideShareEmbed = () => ({
  type: 'HIDE_SHARE_EMBED'
})

const setShareEmbedSize = size => ({
  type: 'SET_SHARE_EMBED_SIZE',
  payload: size
})

export {
  setShareContent,
  showShareEmbed,
  hideShareEmbed,
  setShareEmbedSize
}
