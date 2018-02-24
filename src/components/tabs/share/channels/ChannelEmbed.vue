<template>
  <a class="channel-link" @click="showEmbedOverlay()">
    <span class="channel-icon" :style="iconStyle"><embed-icon color="#fff"></embed-icon></span>
  </a>
</template>

<script>
  import store from 'store'
  import { compose } from 'lodash/fp'

  import EmbedIcon from 'icons/EmbedIcon'

  export default {
    props: ['text', 'subject', 'color'],
    computed: {
      iconStyle () {
        return {
          'background-color': this.color
        }
      }
    },
    methods: {
      showEmbedOverlay: compose(store.dispatch.bind(store), store.actions.showShareEmbed)
    },
    components: {
      EmbedIcon
    }
  }
</script>
