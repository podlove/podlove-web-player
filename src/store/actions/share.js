const toggleShare = () => ({
  type: 'TOGGLE_SHARE'
})

const setEmbedDimensions = dimension => ({
  type: 'SET_EMBED_DIMENSIONS',
  payload: dimension
})

const toggleShareCustomStart = () => ({
  type: 'TOGGLE_SHARE_CUSTOMSTART'
})

const setCustomStarttime = (time) => ({
  type: 'SET_SHARE_CUSTOMSTARTTIME',
  payload: time
})

export {
  toggleShare,
  setEmbedDimensions,
  toggleShareCustomStart,
  setCustomStarttime
}
