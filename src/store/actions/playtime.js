const setPlaytime = playtime => ({
  type: 'SET_PLAYTIME',
  payload: playtime
})

const updatePlaytime = playtime => ({
  type: 'UPDATE_PLAYTIME',
  payload: playtime
})

export {
  setPlaytime,
  updatePlaytime
}
