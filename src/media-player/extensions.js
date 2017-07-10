import { compose, get, head, size } from 'lodash/fp'

// Extensions to howler api and functions
export default (player, { onLoad }) => {
  // Howler doesn't have an "start loading" event, so this is a monkey patch :/
  // Maybe this could be a useful plugin
  const howlerPlay = player.play.bind(player)
  const howlerSeek = player.seek.bind(player)

  let loading = false

  const loadPlayer = (sprite, internal) => {
    onLoad()
    howlerPlay(sprite, internal)
    loading = true
  }

  // Safe Play
  player.play = (sprite, internal) => {
    // honestly, this should be part of core functionality, prevents nasty race conditions...
    if (player.playing(sprite)) {
      return
    }

    if (!loading) {
      return loadPlayer()
    }

    howlerPlay(sprite, internal)
  }

  // Load Hooks
  player.once('load', () => {
    // No api sugar for the audio node :/
    player.audioNode = compose(
      get('_node'),
      player._soundById.bind(player),
      head,
      player._getSoundIds.bind(player))()
  })

  // Buffering Extension
  player.onBuffer = cb => {
    const bufferSize = compose(size, get('buffered'))(player.audioNode)

    if (bufferSize > 0) {
      cb(player.audioNode.buffered.end(bufferSize - 1))
    }
  }

  // Extend seek functionality to be capable of jumping in without loaded player
  player.seek = playtime => {
    if (player.state() === 'unloaded') {
      player.load()
    }

    try {
      return howlerSeek(playtime)
    } catch (err) {
      return 0
    }
  }

  return player
}
