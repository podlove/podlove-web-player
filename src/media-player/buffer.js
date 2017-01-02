import get from 'lodash/get'

export default (audioNode, cb) => {
  const bufferSize = get(audioNode, 'buffered', []).length

  if (bufferSize > 0) {
    cb(audioNode.buffered.end(bufferSize - 1))
  }
}
