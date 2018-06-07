<template>
  <button class="control-button" :class="playstate" @click="onButtonClick()" :disabled="isDisabled(playtime)" id="control-bar--step-back-button">
    <StepBackIcon :color="theme.player.actions.background" aria-hidden="true"></StepBackIcon>
    <span class="visually-hidden">{{ $t('A11Y.PLAYER_STEPPER_BACK', { seconds: 15 }) }}</span>
  </button>
</template>

<script>
  import store from 'store'
  import StepBackIcon from 'icons/StepBackIcon'

  export default {
    components: {
      StepBackIcon
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
        store.dispatch(store.actions.updatePlaytime(this.$select('playtime') - 15000))
      },
      isDisabled (playtime) {
        return (Math.round(playtime, 1) - 15) < 0
      }
    }
  }
</script>
