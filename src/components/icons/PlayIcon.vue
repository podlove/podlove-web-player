<template>
  <svg :width="size" :height="size * 1.142" viewBox="0 0 21 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-17.000000, -13.000000)" :fill="color">
          <polygon points="17.2886 13.0896 37.4846 24.7496 17.2886 36.4096"></polygon>
      </g>
    </g>
  </svg>
</template>

<script>
  export default {
    props: ['color', 'size']
  }
</script>
