<template>
  <div class="podlove-player--overlay" :class="{open: visible}">
    <div class="podlove-player--overlay--inner">
      <div class="podlove-player--overlay--header">
        <slot name="header"></slot>
        <PodloveButton class="podlove-player--overlay--close" :click="onClose"><CloseIcon /></PodloveButton>
      </div>
      <div class="podlove-player--overlay--body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import PodloveButton from './Button.vue'
  import CloseIcon from 'icons/CloseIcon.vue'

  export default {
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    props: ['visible', 'onClose'],
    components: {
      CloseIcon,
      PodloveButton
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'animations';

  .podlove-player--overlay {
    position: absolute;
    width: calc(100% - #{$margin});
    top: 0;
    left: 0;
    margin: $margin / 2;
    padding: $padding;
    background: $background-color;
    box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.5);
    transform: translateY(calc(-100% - #{$margin}));
    transition: transform $animation-duration;

    &.open {
      transform: translateY(50%);
    }

    .podlove-player--overlay--inner {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .podlove-player--overlay--close {
      position: absolute;
      color: $overlay-color;
      right: 0;
      top: 0;
    }

    .podlove-player--overlay--title {
      color: $overlay-color;
      margin: 0 0 ($margin / 2) 0;
      font-size: 1.2rem;
    }

    .podlove-player--overlay--body {
      padding-bottom: $padding / 2;
    }
  }
</style>
