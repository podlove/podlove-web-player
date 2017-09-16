<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20">
    <path :fill="color || 'currentColor'" d="M6 4h12v1H6zM6 9h12v1H6zM6 14h12v1H6zM2 4h2v1H2zM2 9h2v1H2zM2 14h2v1H2z"></path>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
