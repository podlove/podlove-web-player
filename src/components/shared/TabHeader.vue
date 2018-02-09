<template>
  <ul class="tab-header" :class="{ overflows }" v-resize="resizeHandler">
    <span class="header-shadow" :style="headerShadowStyle"></span>
    <slot></slot>
  </ul>
</template>

<script>
  import color from 'color'

  export default {
    data () {
      return {
        overflows: false,
        theme: this.$select('theme')
      }
    },
    computed: {
      headerShadowStyle () {
        return {
          background: `linear-gradient(to bottom, ${color(this.theme.tabs.header.backgroundActive).fade(0)} 0%, ${color(this.theme.tabs.header.backgroundActive).fade(1)} 100%)`
        }
      }
    },
    methods: {
      resizeHandler () {
        this.$nextTick(() => {
          this.overflows = this.$el.scrollWidth > this.$el.clientWidth
        })
      }
    },

    mounted () {
      this.resizeHandler()
    }
  }
</script>
<style lang="scss">
  @import '~styles/variables';

  .tab-header {
    position: relative;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    list-style: none;
    font-weight: 100;
    text-transform: uppercase;
    height: $tabs-header-height;

    .header-shadow {
      display: block;
      position: absolute;
      pointer-events: none;
      top: $tabs-header-height;
      left: 0;
      right: 0;
      height: $padding;
      z-index: $tab-shadow;
    }

    &.overflows .tab-header-item .title {
      display: none;
    }
  }
</style>
