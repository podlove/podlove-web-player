<template>
  <a v-if="type === 'link'" :href="href" class="input-button" :style="active ? activeStyle : style">
    <span class="inner centered">
      <slot></slot>
    </span>
  </a>
  <button v-else :style="active ? activeStyle : style" class="input-button" :disabled="disabled" @click="click ? click() : noop()">
    <span class="inner centered">
      <slot></slot>
    </span>
  </button>
</template>

<script>
  import { noop } from 'lodash'

  export default {
    props: ['click', 'disabled', 'active', 'type', 'href'],
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    computed: {
      style () {
        return {
          color: this.theme.button.color,
          background: this.theme.button.background,
          'border-color': this.theme.button.border
        }
      },

      activeStyle () {
        return {
          color: this.theme.button.background,
          background: this.theme.button.color,
          'border-color': this.theme.button.background
        }
      }
    },
    methods: {
      noop
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
