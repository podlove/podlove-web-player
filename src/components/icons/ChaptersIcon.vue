<template>
  <svg width="25" height="25" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.5">
    <path d="M8 15h5m4 0h25M8 25h5m4 0h25M8 35h5m4 0h25" fill="none" :stroke="color || 'currentColor'" stroke-width="2"/>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
