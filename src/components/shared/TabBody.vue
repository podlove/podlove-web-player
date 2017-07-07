<template>
  <div class="tab-body" :class="{active}" :style="display === 'native' ? bodyStyle(theme) : {}">
    <slot></slot>
  </div>
</template>
<script>
  const bodyStyle = theme => ({
    'background-color': theme.tabs.body.background
  })

  export default {
    props: ['active'],
    data () {
      return {
        theme: this.$select('theme'),
        display: this.$select('display')
      }
    },
    methods: {
      bodyStyle
    }
  }
</script>
<style lang="scss">
  @import 'variables';

  .tab-body {
    max-height: 0;
    overflow: hidden;

    &.active {
      max-height: $tabs-body-max-height;
      overflow-y: auto;
    }
  }
</style>
