import head from 'lodash/fp/head'
import compose from 'lodash/fp/compose'

const getNode = name => node => node.getElementsByTagName(name)
const getText = node => node.innerText

const player = compose(
  head,
  getNode('PodlovePlayer')
)

const audio = compose(
  head,
  getNode('audio'),
  player
)

const text = tag => compose(
  getText,
  head,
  getNode(tag),
  player
)

export default node => ({
  player: player(node),
  audio: audio(node),
  title: text('title')(node),
  subtitle: text('subtitle')(node),
  poster: text('poster')(node)
})
