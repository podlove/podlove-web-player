<template>
  <ul class="podlove-tabs--tab-header" :style="headerStyle(theme)">
    <slot></slot>
  </ul>
</template>
<script>
  import color from 'color'
  const headerStyle = theme => ({
    'background-color': color(theme.tabs.header.background).darken(0.1)
  })

  export default {
    data() {
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
  .podlove-tabs--tab-header {
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
  }
</style>
