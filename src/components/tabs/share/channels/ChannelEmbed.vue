<template>
  <a class="channel-link" @click="showEmbedOverlay()">
    <span class="channel-icon" :style="iconStyle"><EmbedIcon color="#fff"></EmbedIcon></span>
  </a>
</template>

<script>
  import store from 'store'
  import { compose } from 'lodash/fp'

  import ButtonComponent from 'shared/Button.vue'
  import EmbedIcon from 'icons/EmbedIcon.vue'

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
      ButtonComponent,
      EmbedIcon
    }
  }
</script>
