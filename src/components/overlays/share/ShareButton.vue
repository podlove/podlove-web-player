<template>
  <PodloveButton :click="toggleShare" class="podlove-player--share-button"><ShareIcon :color="theme.overlay.button" /></PodloveButton>
</template>

<script>
  import store from 'store'

  import PodloveButton from 'shared/Button.vue'
  import ShareIcon from 'icons/ShareIcon.vue'

  const toggleShare = () => {
    store.dispatch(store.actions.toggleShare())
  }

  export default {
    data() {
      return {
        theme: this.$select('theme')
      }
    },
    components: {
      PodloveButton,
      ShareIcon
    },
    methods: {
      toggleShare
    }
  }
</script>

<style lang="scss">
  .podlove-player--share-button {
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }
</style>
