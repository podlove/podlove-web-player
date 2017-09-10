<template>
  <svg width="18" height="23" viewBox="0 0 18 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-16.000000, -14.000000)" :fill="color">
            <g transform="translate(16.000000, 14.000000)">
                <polygon points="18 23 12 23 12 0 18 0"></polygon>
                <polygon points="6 23 0 23 0 0 6 0"></polygon>
            </g>
        </g>
    </g>
  </svg>
</template>

<script>
  export default {
    props: ['color']
  }
</script>
