const simulatePlaytime = playtime => ({
  type: 'SIMULATE_PLAYTIME',
  payload: playtime
})

const enableGhostMode = () => ({
  type: 'ENABLE_GHOST_MODE'
})

const disableGhostMode = () => ({
  type: 'DISABLE_GHOST_MODE'
})

export {
  simulatePlaytime,
  enableGhostMode,
  disableGhostMode
}
