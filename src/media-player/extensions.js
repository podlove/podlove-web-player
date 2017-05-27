// Extensions to howler api and functions
export default (player, { onLoad }) => {
  // Howler doesn't have an "start loading" event, so this is a monkey patch :/
  // Maybe this could be a useful plugin
  const howlerPlay = player.play.bind(player)
  const howlerSeek = player.seek.bind(player)
  let initialPlay = false

  player.once('play', () => {
    initialPlay = true
  })

  // Safe Play
  player.play = (sprite, internal) => {
    if (!initialPlay) {
      onLoad()
    }

    howlerPlay(sprite, internal)
  }

  // Safe Seek
  player.seek = (playtime) => {
    try {
      return howlerSeek(playtime)
    } catch (err) {

    }
  }

  // Extend seek functionality to be capable of jumping in without loaded player
  player.setPlaytime = playtime => {
    if (player.state() === 'unloaded') {
      player.load()
    }

    player.seek(playtime)
  }

  return player
}
