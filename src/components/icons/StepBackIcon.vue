<template>
  <svg :width="width" :height="height" viewBox="0 0 36 31" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-294.000000, -156.000000)" :fill="secondaryColor">
          <g transform="translate(296.000000, 147.000000)">
              <g transform="translate(0.000000, 10.000000)">
                  <path d="M19.0396825,0.652777778 C11.8491217,0.652777778 5.91681834,5.97589594 4.92507937,12.890873 L0.682539683,12.890873 L6.8015873,21.0496032 L12.9206349,12.890873 L9.04795767,12.890873 C9.99618342,8.24220988 14.1154356,4.73214286 19.0396825,4.73214286 C24.6655802,4.73214286 29.2380952,9.30828395 29.2380952,14.9305556 C29.2380952,20.5528272 24.6655802,25.1289683 19.0396825,25.1289683 L19.0396825,29.2083333 C26.9282681,29.2083333 33.3174603,22.815515 33.3174603,14.9305556 C33.3174603,7.04559612 26.9282681,0.652777778 19.0396825,0.652777778"
                    :stroke="primaryColor" stroke-width="2" fill-rule="evenodd"></path>
                  <text fontFamily="Roboto-Medium, Roboto" fontSize="12" fontWeight="400" letterSpacing="-0.0500000007">
                      <tspan x="12" y="22">{{text}}</tspan>
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
