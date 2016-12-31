import React from 'react'
// Icon

export default React.createClass({
  getDefaultProps() {
    return {
      width: '50',
      height: '50',
      layer: '#fff',
      action: '#2B8AC6'
    };
  },
 render() {
   const { height, width, layer, action } = this.props;

   return (
      <svg width={width} height={height} viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-359.000000, -147.000000)">
            <g transform="translate(296.000000, 147.000000)">
                <g  transform="translate(63.000000, 0.000000)">
                    <path d="M50,25 C50,38.8061856 38.8061856,50 25,50 C11.1938144,50 0,38.8061856 0,25 C0,11.1938144 11.1938144,0 25,0 C38.8061856,0 50,11.1938144 50,25 L50,25 Z" fill={layer}></path>
                    <polygon fill={action} points="17.2886 13.0896 37.4846 24.7496 17.2886 36.4096"></polygon>
                </g>
            </g>
        </g>
    </g>
      </svg>
   )
 }
})
