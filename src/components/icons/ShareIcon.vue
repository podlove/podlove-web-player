<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="23" viewBox="0 0 20 20">
    <path :fill="color || 'currentColor'" d="M12.15 4L9.5 1.4 6.85 4l-.7-.7L9.5 0l3.35 3.3"></path>
    <path fill="none" :stroke="color || 'currentColor'" d="M9.5 10V1M6 5.5H3.5v13h12v-13H13"></path>
</svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
