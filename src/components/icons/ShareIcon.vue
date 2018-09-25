<template>
  <svg width="25" height="25" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-miterlimit="1.5">
    <path d="M23.98 5.52l-3.537 3.576L19 7.638s4.221-4.395 5.221-5.335C24.425 2.112 24.75 2 25 2s.531.123.721.302c1 .94 5.279 5.336 5.279 5.336l-1.443 1.458L26.02 5.52 26 22h-2.04l.02-16.48" :fill="color || 'currentColor'" fill-rule="nonzero"/>
    <path d="M18 13h-5v24h24V13h-5" fill="none" :stroke="color || 'currentColor'" stroke-width="2"/>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
