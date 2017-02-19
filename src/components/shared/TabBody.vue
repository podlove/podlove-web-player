<template>
  <div class="podlove-tabs--tab-body" :class="{active}">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    props: ['active']
  }
</script>
<style lang="scss">
  @import 'variables';

  .podlove-tabs--tab-body {
    max-height: 0;
    overflow: hidden;
    background-color: $background-color;

    &.active {
      max-height: $tabs-body-max-height;
    }
  }
</style>
