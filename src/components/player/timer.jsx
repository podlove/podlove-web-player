import React from 'react'
import {connect} from 'react-redux'

import { player } from '../../actions'

const calcSeconds = (time = 0) => parseInt(time % 60)
const calcMinutes = (time = 0) => parseInt( time / 60 ) % 60
const calcHours = (time = 0) => parseInt( time / 3600 ) % 24
const leadingZero = (time) => time > 9 ? `${time}` : `0${time}`

const counter = time => {
  let hours = calcHours(time)
  let minutes = calcMinutes(time)
  let seconds = calcSeconds(time)

  let result = `${leadingZero(minutes)}:${leadingZero(seconds)}`

  if (hours > 0) {
    result = `${leadingZero(hours)}:${result}`
  }

  return result
}


const Timer = ({playtime, duration}) => (
  <div className="podlove-player--timer">
    <span className="podlove-player--timer--current">{counter(playtime)}</span>
    <span className="podlove-player--timer--duration">{counter(duration)}</span>
  </div>
)

const mapStateToProps = state => ({
  playtime: state.playtime,
  duration: state.duration
})

export default connect(
  mapStateToProps
)(Timer)
