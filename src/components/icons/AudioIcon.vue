<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path :fill="color" d="M9 18h-7v-12h7v12zm2-12v12l11 6v-24l-11 6z"/>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>

