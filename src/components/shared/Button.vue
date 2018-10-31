<template>
  <a v-if="href" :href="href" class="input-button" :style="style">
    <span class="inner centered">
      <slot></slot>
    </span>
  </a>
  <button v-else :style="style" class="input-button" :disabled="disabled">
    <span class="inner centered">
      <slot></slot>
    </span>
  </button>
</template>

<script>
  import { mapState } from 'redux-vuex'

  export default {
    props: ['disabled', 'active', 'href', 'type'],
    data: mapState('theme'),
    computed: {
      style () {
        const style = {
          color: null,
          background: null,
          'border-color': null
        }

        switch (this.type) {
          case 'active':
            style.color = this.theme.button.background
            style.background = this.theme.button.color
            style['border-color'] = this.theme.button.background
            break

          case 'light':
            style.color = this.theme.button.color
            style.background = this.theme.button.light
            style['border-color'] = this.theme.button.border
            break

          default:
            style.color = this.theme.button.color
            style.background = this.theme.button.background
            style['border-color'] = this.theme.button.border
        }

        return style
      }
    },
    methods: {
      clickHandler (event) {
        console.log('call', event)
        this.$emit('click', event)
      }
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';
  @import '~styles/font';

  .input-button {
    opacity: 1;
    transition: opacity $animation-duration;

    font-size: 1em;

    cursor: pointer;

    background: transparent;
    outline: none;

    &[disabled] {
      opacity: 0.5;
    }

    border-radius: 4px;
    border-width: 1px;
    border-style: solid;

    .inner {
      width: 100%;
      height: 100%;
    }

    &:hover {
      opacity: 0.8;
    }

    &.block {
      display: block;
      width: 100%;
    }

    text-align: center;

    svg {
      display: inline;
    }

    &.action .inner {
      text-transform: uppercase;
      padding: $padding / 2;
      line-height: $padding + $padding / 2;
    }
  }
</style>
