<template>
  <svg width="23" height="24" viewBox="0 0 23 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g :stroke="color || 'currentColor'">
          <path d="M11.5,0.527397656 L11.5,22.5273977"></path>
          <path d="M22.5,11.5273977 L0.5,11.5273977"></path>
        </g>
    </g>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>

