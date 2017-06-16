<template>
  <ul class="tab-header" :style="headerStyle(theme)">
    <slot></slot>
  </ul>
</template>
<script>
  import color from 'color'
  const headerStyle = theme => ({
    'background-color': color(theme.tabs.header.background).darken(0.1)
  })

  export default {
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    methods: {
      headerStyle
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

    &::after {
      position: absolute;
      top: $tabs-header-height;
      left: 1px;
      right: 1px;
      content: ' ';
      display: block;
      height: $padding;
      background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      z-index: 100;
    }
  }
</style>
