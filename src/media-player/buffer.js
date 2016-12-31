export default (player, cb) => () => {
  const bufferSize = player.buffered.length

  if (bufferSize > 0) {
    cb(player.buffered.end(bufferSize - 1))
  }
}
