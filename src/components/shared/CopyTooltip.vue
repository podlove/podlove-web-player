<template>
  <v-popover ref="popover" :popover-class="[ theme.negative ? 'negative' : '' ]" :auto-hide="true" trigger="manual" delay.show="100" delay.hide="3000">
    <span @click="onClick" @mouseleave="onMouseLeave">
      <slot class="tooltip-target"></slot>
    </span>
    <template slot="popover">
      {{ $t('MESSAGES.COPIED') }}
    </template>
  </v-popover>
</template>

<script>
import copy from 'copy-to-clipboard'

import { VPopover } from 'v-tooltip'

export default {
  props: ['content'],
  data () {
    return {
      theme: this.$select('theme'),
      open: false
    }
  },

  methods: {
    onClick () {
      if (!this.content) {
        return
      }

      copy(this.content)
      this.show()
      setTimeout(() => this.hide(), 6000)
    },

    show() {
      this.$refs.popover.show()
    },

    hide() {
      this.$refs.popover.hide()
    },

    onMouseLeave () {
      this.hide()
    }
  },

  components: {
    VPopover
  }
}
</script>

<style lang="scss">
  .trigger {
    display: block !important;
  }
</style>
