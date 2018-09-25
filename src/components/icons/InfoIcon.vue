<template>
  <svg width="25" height="25" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414">
    <circle cx="25" cy="25" r="18.05" fill="none" :stroke="color || 'currentColor'" stroke-width="2"/>
    <circle cx="25" cy="16.6" r="2.749" :fill="color || 'currentColor'"/>
    <path d="M21 22h6v12h2v2h-8v-2h2V24h-2v-2z" :fill="color || 'currentColor'"/>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>

