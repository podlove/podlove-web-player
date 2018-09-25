<template>
  <svg width="25" height="25" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414">
      <path d="M16 35h-5.525C6.358 35 3 31.688 3 27.594c0-3.749 2.806-6.854 6.44-7.337.184-6.647 5.635-11.96 12.374-11.96 5.773 0 10.649 3.933 11.983 9.246a9.135 9.135 0 0 1 3.703-.782c5.083 0 9.2 4.071 9.2 9.108 0 5.037-4.117 9.108-9.2 9.108L30 35" fill="none" :stroke="color || 'currentColor'" stroke-width="2"/>
      <path d="M24.02 42.48l3.537-3.576L29 40.362s-4.221 4.395-5.221 5.335A1.232 1.232 0 0 1 23 46c-.25 0-.531-.123-.721-.302-1-.94-5.279-5.336-5.279-5.336l1.443-1.458 3.537 3.576L22 26h2.04l-.02 16.48" :fill="color || 'currentColor'" fill-rule="nonzero"/>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
