<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
    <path :fill="color" d="M16 11h5l-9 10-9-10h5v-11h8v11zm1 11h-10v2h10v-2z"/>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
