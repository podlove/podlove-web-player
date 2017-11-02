<template>
  <svg width="25px" height="25px" viewBox="0 0 25 25" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-15.000000, -436.000000)">
              <g transform="translate(0.000000, 341.000000)">
                  <rect :fill="backgroundColor || 'currentColor'" x="15" y="95" width="25" height="25" rx="12.5"></rect>
                  <g transform="translate(26.500000, 107.500000) rotate(180.000000) translate(-26.500000, -107.500000) translate(23.000000, 103.000000)" :fill="textColor || '#FFFFFF'">
                      <polygon points="0 0 7 4.04139434 0 8.08278867"></polygon>
                  </g>
              </g>
          </g>
      </g>
  </svg>
</template>

<script>
export default {
  props: ["backgroundColor", "textColor"]
};
</script>

<style>

</style>
