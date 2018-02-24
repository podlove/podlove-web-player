<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" ratio="1">
    <rect x="6" y="4" width="12" height="1" :fill="color || 'currentColor'"></rect>
    <rect x="6" y="9" width="12" height="1" :fill="color || 'currentColor'"></rect>
    <rect x="6" y="14" width="12" height="1" :fill="color || 'currentColor'"></rect>
    <rect x="2" y="4" width="2" height="1" :fill="color || 'currentColor'"></rect>
    <rect x="2" y="9" width="2" height="1" :fill="color || 'currentColor'"></rect>
    <rect x="2" y="14" width="2" height="1" :fill="color || 'currentColor'"></rect>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
