<template>
<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 20 20">
  <ellipse cx="6.11" cy="3.55" fill="none" :stroke="color || 'currentColor'" rx="2.11" ry="2.15"/>
  <ellipse cx="13.15" cy="15.55" fill="none" :stroke="color || 'currentColor'" rx="2.1" ry="2.15"/>
  <circle cx="13.15" cy="9.55" r="2.15" fill="none" :stroke="color || 'currentColor'"/>
  <path :fill="color || 'currentColor'" d="M1 3h3v1H1zm9 0h8v1h-8zM1 9h8v1H1zm14 0h3v1h-3zM1 15h8v1H1zm14 0h3v1h-3z"/>
</svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
