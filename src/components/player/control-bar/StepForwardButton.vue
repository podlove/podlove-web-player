<template>
  <button class="control-button" :class="playstate" @click="onButtonClick()" :disabled="isDisabled(playtime, duration)" id="control-bar--step-forward-button">
    <step-forward-icon :color="theme.player.actions.background"></step-forward-icon>
  </button>
</template>

<script>
  import store from 'store'
  import StepForwardIcon from 'icons/StepForwardIcon'

  export default {
    components: {
      StepForwardIcon
    },
    data () {
      return {
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
        playstate: this.$select('playstate'),
        theme: this.$select('theme')
      }
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.updatePlaytime(this.$select('playtime') + 30000))
      },
      isDisabled (playtime, duration) {
        return (Math.round(playtime, 1) + 30) > Math.round(duration, 1)
      }
    }
  }
</script>
