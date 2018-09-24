<template>
  <svg width="25" height="25" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-miterlimit="1.5">
      <g fill="none" :stroke="color || 'currentColor'" stroke-width="2">
          <path d="M6 9h7m13 0h16m0 14h-5m-13 0H6m36 14h-5m-13 0H6"/>
          <circle cx="17.5" cy="9" r="4.5" stroke-linejoin="round" stroke-miterlimit="1.414"/>
          <circle cx="33" cy="23" r="4.5" stroke-linejoin="round" stroke-miterlimit="1.414"/>
          <circle cx="33" cy="37" r="4.5" stroke-linejoin="round" stroke-miterlimit="1.414"/>
      </g>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
