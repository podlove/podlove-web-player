const toggleShare = () => ({
  type: 'TOGGLE_SHARE'
})

const setEmbedDimensions = (width, height) => ({
  type: 'SET_EMBED_DIMENSIONS',
  payload: {
    width, height
  }
})

export {
  toggleShare,
  setEmbedDimensions
}
