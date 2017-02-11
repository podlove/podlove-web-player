<template>
  <transition name="overlay">
    <div class="podlove-player--overlay" :class="{open: visible}" v-if="visible">
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
  </transition>
</template>

<script>
  import PodloveButton from './Button.vue'
  import CloseIcon from 'icons/CloseIcon.vue'

  export default {
    data() {
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
    height: calc(100% - #{$margin});
    top: 0;
    left: 0;
    margin: $margin / 2;
    padding: $padding;
    background: $background-color;
    box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.5);
    transform: translateY(calc(-100% - #{$margin}));

    &.overlay-enter-active {
      animation: bounceInDown 1s;
    }

    &.overlay-leave-active {
      animation: bounceOutUp 1s;
    }

    &.open {
      transform: translateY(0);
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
      margin-top: 0;
      font-size: 1.2rem;
    }
  }
</style>
