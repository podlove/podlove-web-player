<template>
  <div class="input-group" :class="{ [`elements-${elements}`]: true }">
    <slot name="button"></slot>
    <slot name="input"></slot>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        elements: 0
      }
    },

    mounted () {
      this.elements = this.$el.children.length
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .input-group {
    display: flex;

    .input-text, .input-select {
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

    &.elements-3 {
      *:nth-child(2) {
        width: auto;
        border-radius: 0;
      }
    }
  }

</style>
