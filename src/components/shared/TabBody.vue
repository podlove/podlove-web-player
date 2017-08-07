<template>
  <div class="tab-body" :class="{active}" :style="display === 'native' ? bodyStyle : {}">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    props: ['active'],
    data () {
      return {
        theme: this.$select('theme'),
        display: this.$select('display')
      }
    },
    computed: {
      bodyStyle () {
        return {
          'background-color': this.theme.tabs.body.background
        }
      }
    }
  }
</script>
<style lang="scss">
  @import '~styles/variables';

  .tab-body {
    max-height: 0;
    overflow: hidden;

    &.active {
      max-height: $tabs-body-max-height;
      overflow-y: auto;
    }
  }
</style>
