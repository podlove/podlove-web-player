<template>
  <div class="overlay-container" :class="{open: visible}">
    <div class="overlay" :style="backgroundStyle">
      <div class="overlay-inner" tabindex="0" ref="overlay" :aria-label="title">
        <div class="overlay-header">
          <slot name="header"></slot>
          <button class="overlay-close" @click="onClose()">
            <close-icon aria-hidden="true"></close-icon>
            <span class="visually-hidden">{{ $t('A11Y.OVERLAY_CLOSE') }}</span>
          </button>
        </div>
        <div class="overlay-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import CloseIcon from 'icons/CloseIcon'
  import ButtonComponent from './Button'

  export default {
    props: ['visible', 'onClose', 'title'],
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
    watch: {
      visible () {
        this.$refs.overlay && this.$refs.overlay.focus()
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
