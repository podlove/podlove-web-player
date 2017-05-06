<template>
  <ButtonComponent class="podlove-player--player-control" :class="playstate" :click="onButtonClick" :disabled="isDisabled(playtime, duration)">
    <StepForwardIcon
      :primary-color="theme.player.actions.icon"
      :secondary-color="theme.player.actions.background"
    />
  </ButtonComponent>
</template>

<script>
  import store from 'store'
  import ButtonComponent from 'shared/Button.vue'
  import StepForwardIcon from 'icons/StepForwardIcon.vue'

  export default {
    components: {
      ButtonComponent,
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
        store.dispatch(store.actions.updatePlaytime(this.$select('playtime') + 30))
      },
      isDisabled (playtime, duration) {
        return (Math.round(playtime, 1) + 30) > Math.round(duration, 1)
      }
    }
  }
</script>
