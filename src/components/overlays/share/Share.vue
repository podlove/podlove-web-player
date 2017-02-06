<template>
  <PodloveOverlay :visible="share.open" :on-close="toggleShare">
      Share
  </PodloveOverlay>
</template>

<script>
  import store from 'store'
  import PodloveOverlay from 'shared/Overlay.vue'

  const toggleShare = () => {
    store.dispatch(store.actions.toggleShare())
  }

  export default {
    data() {
      return {
        share: this.$select('share')
      }
    },
    components: {
      PodloveOverlay
    },
    methods: {
      toggleShare
    }
  }
</script>
