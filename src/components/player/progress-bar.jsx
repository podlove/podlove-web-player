import React from 'react'
import {connect} from 'react-redux'

import { player } from '../../actions'

const interpolate = (num = 0) => Math.round(num * 100) / 100

const buffered = (buffer = 0, duration = 1) => {
  const bufferLength = (buffer * 100) / duration

  return {
     width: Math.round(bufferLength) + '%'
  }
}

const ProgressBar = ({playtime, duration, buffer, onMove}) => (
  <div className="podlove-player--progress-bar">
    <input
      className="podlove-player--progress-slider"
      type="range"
      min="0" max={interpolate(duration)} step="0.1"
      value={interpolate(playtime)}
      onChange={onMove}
      data-buffered={buffered(buffer, duration)}
    />
    <span className="podlove-player--progress-buffer" style={buffered(buffer, duration)}></span>
  </div>
)

const mapStateToProps = state => ({
  playtime: state.playtime,
  duration: state.duration,
  buffer: state.buffer
})

const mapDispatchToProps = () => ({
  onMove: event => player.updatePlaytime(event.target.value)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProgressBar)
