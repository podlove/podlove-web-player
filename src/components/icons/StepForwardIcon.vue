<template>
  <svg :width="width" :height="height" viewBox="0 0 36 31" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(-439.000000, -156.000000)" :fill="secondaryColor">
            <g transform="translate(296.000000, 147.000000)">
                <g transform="translate(144.000000, 10.000000)">
                    <path d="M18.3571429,0 C11.166582,0 5.23427866,5.32311817 4.24253968,12.2380952 L2.13162821e-14,12.2380952 L6.11904762,20.3968254 L12.2380952,12.2380952 L8.36541799,12.2380952 C9.31364374,7.5894321 13.4328959,4.07936508 18.3571429,4.07936508 C23.9830406,4.07936508 28.5555556,8.65550617 28.5555556,14.2777778 C28.5555556,19.9000494 23.9830406,24.4761905 18.3571429,24.4761905 L18.3571429,28.5555556 C26.2457284,28.5555556 32.6349206,22.1627372 32.6349206,14.2777778 C32.6349206,6.39281834 26.2457284,0 18.3571429,0" :stroke="primaryColor" strokeWidth="2" fillRule="evenodd" transform="translate(16.317460, 14.277778) scale(-1, 1) translate(-16.317460, -14.277778) "></path>
                    <text fontFamily="Roboto-Medium, Roboto" fontSize="12" fontWeight="400" letterSpacing="-0.0500000007">
                        <tspan x="7" y="21">{{text}}</tspan>
                    </text>
                </g>
            </g>
        </g>
    </g>
  </svg>
</template>

<script>
  export default {
    props: ['width', 'height', 'text', 'primaryColor', 'secondaryColor']
  }
</script>
