<template>
  <div class="input-group">
    <slot name="button"></slot>
    <slot name="input"></slot>
  </div>
</template>

<script>
  export default { }
</script>

<style lang="scss">
  @import '~styles/variables';

  .input-group {
    display: flex;

    .input-text {
      padding: $padding / 2;
      width: calc(100% - #{$addon-button-width});
      border-radius: 0 3px 3px 0;
      border-width: 1px 1px 1px 0;
      height: $input-height;
    }
    .input-button {
      width: $addon-button-width;
      border-width: 1px;
      border-radius: 3px 0 0 3px;
    }
  }

</style>
