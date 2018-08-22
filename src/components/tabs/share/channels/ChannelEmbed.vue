<template>
  <button class="channel-link" @click="showEmbedOverlay()">
    <span class="channel-icon" :style="iconStyle" aria-hidden="true"><embed-icon color="#fff"></embed-icon></span>
    <span class="visually-hidden">{{ $t('A11Y.SHARE_EMBED') }}</span>
  </button>
</template>

<script>
  import { mapActions } from 'redux-vuex'

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
    methods: mapActions({
      showEmbedOverlay: 'showShareEmbed'
    }),
    components: {
      EmbedIcon
    }
  }
</script>
