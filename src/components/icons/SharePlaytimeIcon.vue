<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" ratio="1">
    <polygon fill="none" :stroke="color || 'currentColor'" stroke-width="1.1" points="8.5 7 13.5 10 8.5 13"></polygon>
    <circle fill="none" :stroke="color || 'currentColor'" stroke-width="1.1" cx="10" cy="10" r="9"></circle>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
