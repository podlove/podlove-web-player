<template>
  <div class="tab-body" :class="{active}">
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

  .tab-body {
    max-height: 0;
    overflow: hidden;
    background-color: $background-color;
    border-color: rgba($accent-color, 0.1);
    border-width: 0;
    border-style: solid;

    &.active {
      max-height: $tabs-body-max-height;
      border-width: 0 1px 1px 1px;
      overflow-y: auto;
    }
  }
</style>
