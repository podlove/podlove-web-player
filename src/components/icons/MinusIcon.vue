<template>
  <svg width="24" height="2" viewBox="0 0 24 2" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g :stroke="color || 'currentColor'">
        <path d="M23.5,0.527397656 L0.5,0.527397656"></path>
      </g>
    </g>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>

