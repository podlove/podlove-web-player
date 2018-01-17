<template>
  <svg width="75" height="25" viewBox="0 0 75 25" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <rect id="color-path" x="0" y="0" width="75" height="25" rx="12.5"></rect>
    </defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g>
            <use :fill="backgroundColor || 'currentColor'" fill-rule="evenodd" xlink:href="#color-path"></use>
            <rect :stroke="borderColor || backgroundColor || 'currentColor'" stroke-width="1" x="0.5" y="0.5" width="74" height="24" rx="12"></rect>
        </g>
        <text font-size="12" font-weight="normal" line-spacing="20" :fill="textColor || '#FFFFFF'" class="text">
            <tspan x="23.4375" y="17">{{ text }}</tspan>
        </text>
        <polygon :fill="textColor || '#FFFFFF'" points="11 8 18 12.0413943 11 16.0827887"></polygon>
    </g>
</svg>
</template>

<script>
export default {
  props: ['textColor', 'backgroundColor', 'borderColor', 'text']
}
</script>

<style lang="scss" scoped>
  .text {
    text-transform: uppercase;
  }
</style>
