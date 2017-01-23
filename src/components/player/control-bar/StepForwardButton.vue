<template>
  <button class="podlove-player--button podlove-player--player-control" :class="playstate" @click="onButtonClick" :disabled="(playtime + 30) < 0">
    <Icon
      :primary-color="theme.player.actions.icon"
      :secondary-color="theme.player.actions.background"
    />
  </button>
</template>

<script>
  import store from 'store'
  import Icon from '../../icons/StepForwardIcon.vue'

  export default {
    components: {
      Icon
    },
    data () {
      return {
        playtime: this.$select('playtime'),
        playstate: this.$select('playstate'),
        theme: this.$select('theme')
      }
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.updatePlaytime(this.$select('playtime') + 30))
      }
    }
  }
</script>
