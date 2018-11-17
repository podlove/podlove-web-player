<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24.8 21">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g :stroke="color || 'currentColor'">
        <path d="M5.5,7.5H2C1.2,7.5,0.5,8.2,0.5,9v3c0,0.8,0.7,1.5,1.5,1.5h3.5l7,7v-20L5.5,7.5L5.5,7.5z"/>
        <path d="M20,2.5c2.2,1.9,3.5,4.8,3.5,8s-1.3,6.1-3.5,8"/>
        <path d="M17.5,4.5c1.7,1.4,3,3.7,3,6c0,2.3-1.3,4.6-3,6"/>
        <path d="M15.5,7c1.1,0.8,2,2,2,3.5s-0.9,2.7-2,3.5"/>
      </g>
    </g>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
