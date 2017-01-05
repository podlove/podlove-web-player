import React from 'react'
import {connect} from 'react-redux'

const Header = ({title, poster, subtitle, mode}) => (
    <div className="podlove-header">
      <img className="podlove-header--poster" src={poster} />
      <div className="podlover-header--info">
        <h1 className="podlove-header--title">{title}</h1>
        <div className="podlove-header--subtitle">{subtitle}</div>
      </div>
    </div>
)

const mapStateToProps = state => ({
  title: state.title,
  subtitle: state.subtitle,
  poster: state.poster,
  mode: state.mode
})

export default connect(
  mapStateToProps
)(Header)
