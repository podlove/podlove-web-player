<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 50 50">
    <g v-show="muted || volume <= 0" stroke="none" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g :stroke="color || 'currentColor'">
          <polyline points="19 38 26 45 26 28"></polyline>
          <path d="M26,16 L26,5 L12,19 L5,19 C3.4,19 2,20.4 2,22 L2,28 C2,29.6 3.4,31 5,31 L10,31"></path>
          <path d="M32,25 C32,27.8 29.8,30 27,30 L26,30"></path>
          <path d="M4,45 L44,5"></path>
      </g>
    </g>
    <g v-show="!muted && volume > 0" stroke="none" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
      <g :stroke="color || 'currentColor'">
        <path d="M12,19 L5,19 C3.4,19 2,20.4 2,22 L2,28 C2,29.6 3.4,31 5,31 L12,31 L26,45 L26,5 L12,19 L12,19 Z"></path>
        <path v-show="volume > 0.5" d="M41,9 C45.4,12.8 48,18.6 48,25 C48,31.4 45.4,37.2 41,41"></path>
        <path v-show="volume > 0.25" d="M36,13 C39.4,15.8 42,20.4 42,25 C42,29.6 39.4,34.2 36,37"></path>
        <path d="M32,18 C34.2,19.6 36,22 36,25 C36,28 34.2,30.4 32,32"></path>
      </g>
    </g>
  </svg>
</template>

<script>
  export default {
    props: ['color', 'volume', 'muted']
  }
</script>
