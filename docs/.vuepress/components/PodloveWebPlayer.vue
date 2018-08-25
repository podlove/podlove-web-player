<template>
  <div class="player" :id="id"></div>
</template>

<script>
  export default {
    name: 'PodloveWebPlayer',
    props: ['config', 'mode', 'id'],
    mounted: function () {
      window.podlovePlayer(this.$el, this.config).then(store => {
        this.$emit('ready', store)
        return store
      }).then(window.registerExternalEvents(this.id))
    }
  }
</script>

<style lang="scss" scoped>
  .player {
    margin-bottom: 1.5em;
  }
</style>
