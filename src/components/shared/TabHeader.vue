<template>
  <ul class="tab-header">
    <span class="header-shadow" :style="headerShadowStyle(theme)"></span>
    <slot></slot>
  </ul>
</template>
<script>
  import color from 'color'

  const headerShadowStyle = theme => ({
    background: `linear-gradient(to bottom, ${color(theme.tabs.header.backgroundActive).fade(0)} 0%, ${color(theme.tabs.header.backgroundActive).fade(1)} 100%)`
  })

  export default {
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    methods: {
      headerShadowStyle
    }
  }
</script>
<style lang="scss">
  @import 'variables';

  .tab-header {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    list-style: none;
    font-weight: 100;
    text-transform: uppercase;
    height: $tabs-header-height;

    .header-shadow {
      display: block;
      position: absolute;
      pointer-events: none;
      top: $tabs-header-height;
      left: 0;
      right: 0;
      height: $padding;
      z-index: 100;
    }
  }
</style>
