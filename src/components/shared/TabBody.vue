<template>
  <div class="tab-body" :class="{active}" :style="display === 'native' ? bodyStyle : {}" role="tabpanel" :aria-labelledby="`trigger-${name}`" tabindex="0" :aria-hidden="!active">
    <slot tabindex="0"></slot>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'

  export default {
    props: ['active', 'name', 'index'],
    data: mapState('theme', 'display'),
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

    &.fixed {
      overflow: hidden;
    }
  }
</style>
