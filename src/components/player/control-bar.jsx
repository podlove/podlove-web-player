import React from 'react'
import {connect} from 'react-redux'

import { player } from '../../actions'
import { PauseIcon, PlayIcon, ForwardIcon, BackIcon } from '../icons'

// Play/Pause Button
const PlayButton = (running, onPlayButtonClick, onPauseButtonClick) => {
  if (running) {
    return <button className="podlove-player--button" onClick={onPauseButtonClick}><PauseIcon /></button>
  } else {
    return <button className="podlove-player--button" onClick={onPlayButtonClick}><PlayIcon /></button>
  }
}

const ForwardButton = (playtime, duration, onButtonClick) => (
  <button
    disabled={(playtime + 30) > duration}
    className="podlove-player--button"
    onClick={onButtonClick(playtime + 30)}>
    <ForwardIcon />
  </button>
)

const BackButton = (playtime, onButtonClick) => (
  <button
    disabled={(playtime - 30) < 0}
    className="podlove-player--button"
    onClick={onButtonClick(playtime - 30)}>
    <BackIcon />
  </button>
)

const ControlBar = ({running, playtime, duration, onPlayButtonClick, onPauseButtonClick, onSkipButtonClick}) => (
    <div className="podlove-player--control-bar">
      {BackButton(playtime, onSkipButtonClick)}
      {PlayButton(running, onPlayButtonClick, onPauseButtonClick)}
      {ForwardButton(playtime, duration, onSkipButtonClick)}
    </div>
)

const mapStateToProps = state => ({
  running: state.running,
  playtime: state.playtime,
  duration: state.duration
})

const mapDispatchToProps = () => ({
  onPlayButtonClick: player.play,
  onPauseButtonClick: player.pause,
  onSkipButtonClick: time => () => player.updatePlaytime(time)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ControlBar)
