<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24.8" height="21" viewBox="0 0 24.8 21">
    <!-- Muted / 0% -->
    <g v-if="muted || volume <= 0" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g :stroke="color || 'currentColor'">
        <polyline points="9,17 12.5,20.5 12.5,12"/>
        <path d="M12.5,6V0.5l-7,7H2C1.2,7.5,0.5,8.2,0.5,9v3c0,0.8,0.7,1.5,1.5,1.5h2.5"/>
        <path d="M15.5,10.5c0,1.4-1.1,2.5-2.5,2.5h-0.5"/>
        <path d="M1.5,20.5l20-20"/>
      </g>
    </g>
    <!-- 25% -->
    <g v-else-if="!muted && volume > 0 && volume <= 25" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g :stroke="color || 'currentColor'">
        <path d="M5.5,7.5H2C1.2,7.5,0.5,8.2,0.5,9v3c0,0.8,0.7,1.5,1.5,1.5h3.5l7,7v-20L5.5,7.5L5.5,7.5z"/>
        <path d="M15.5,7c1.1,0.8,2,2,2,3.5s-0.9,2.7-2,3.5"/>
      </g>
    </g>
    <!-- 50% -->
    <g v-else-if="!muted && volume > 25 && volume <= 50" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g :stroke="color || 'currentColor'">
        <path d="M5.5,7.5H2C1.2,7.5,0.5,8.2,0.5,9v3c0,0.8,0.7,1.5,1.5,1.5h3.5l7,7v-20L5.5,7.5L5.5,7.5z"/>
        <path d="M17.5,4.5c1.7,1.4,3,3.7,3,6c0,2.3-1.3,4.6-3,6"/>
        <path d="M15.5,7c1.1,0.8,2,2,2,3.5s-0.9,2.7-2,3.5"/>
      </g>
    </g>
    <!-- 75% -->
    <g v-else stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
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
    props: ['color', 'volume', 'muted']
  }
</script>

