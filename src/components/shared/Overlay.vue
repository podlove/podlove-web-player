<template>
  <div class="overlay-container" :class="{open: visible}">
    <div class="overlay" :style="backgroundStyle">
      <div class="overlay-inner">
        <div class="overlay-header">
          <slot name="header"></slot>
          <button class="overlay-close" @click="onClose()"><CloseIcon /></button>
        </div>
        <div class="overlay-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ButtonComponent from './Button.vue'
  import CloseIcon from 'icons/CloseIcon.vue'

  export default {
    props: ['visible', 'onClose'],
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    computed: {
      backgroundStyle () {
        return {
          background: this.theme.overlay.background
        }
      }
    },
    components: {
      CloseIcon,
      ButtonComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .overlay-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: -100%;
    overflow: hidden;

    display: flex;
    align-content: center;
    justify-content: center;
    pointer-events: none;

    transition: top $animation-duration;

    z-index: $overlay-level;

    &.open {
      top: 0;
    }
  }

  .overlay {
    position: relative;
    pointer-events: auto;

    max-width: calc(100% - #{$margin});
    max-height: calc(100% - #{$margin});
    margin: auto;
    padding: $padding;
    background: $background-color;
    box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.5);

    .overlay-inner {
      position: relative;
      width: 100%;
    }

    .overlay-close {
      position: absolute;
      color: $overlay-color;
      right: 0;
      top: 0;
    }

    .overlay-title {
      color: $overlay-color;
      margin: 0 0 ($margin / 2) 0;
      font-size: 1.2rem;
    }

    .overlay-body {
      padding-bottom: $padding / 2;
    }
  }
</style>
