import React from 'react'

import ControlBar from './control-bar.jsx'
import ProgressBar from './progress-bar.jsx'
import Timer from './timer.jsx'

import './player.scss'

export default React.createClass({
    render(){
      return (
        <div className="podlove-player">
          <ControlBar />
          <ProgressBar />
          <Timer />
        </div>
      )
    }
})
